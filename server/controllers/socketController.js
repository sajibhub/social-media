import mongoose from "mongoose";
import { io } from "../app.js";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";

const Chat = () => {
  io.on("connection", (socket) => {

    // Event to create a new conversation
    socket.on("conversationCreated", async (data) => {
      try {
        const { senderId, receiverId } = JSON.parse(data);

        const existingConversation = await Conversation.findOne({
          participants: {
            $all: [senderId, receiverId]
          }
        });

        if (!existingConversation) {
          const newConversation = await Conversation.create({
            participants: [senderId, receiverId],
            type: "private",
          });

          // Emit to both users about the new conversation
          [senderId, receiverId].forEach(userId =>
            io.to(userId.toString()).emit("conversationCreated", newConversation)
          );
        }
      } catch (error) {
        io.emit("error", error.message); // Emit error to all clients
      }
    });

    // Event to get all conversations for a user
    socket.on('getConversation', async (data) => {
      try {
        let { userId } = data;

        userId = new mongoose.Types.ObjectId(userId); // Replace with actual userId

        const conversations = await Conversation.aggregate([
          {
            $match: { participants: userId } // Filter by userId in participants
          },
          {
            $lookup: {
              from: "users",
              let: { participantIds: "$participants" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$participantIds"] } } },
                { $project: { _id: 1, fullName: 1, username: 1, profile: 1 } }
              ],
              as: "participantDetails"
            }
          },
          {
            $project: {
              _id: 1,
              type: 1,
              lastMessage: 1,
              updatedAt: 1,
              participants: 1,
              participant: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$participantDetails",
                      as: "participant",
                      cond: { $ne: ["$$participant._id", userId] }
                    }
                  },
                  0
                ]
              }
            }
          },
          {
            $sort: { updatedAt: -1 }
          }
        ]);
        io.to(data.userId.toString()).emit('getConversation', conversations);

      } catch (error) {
        socket.emit("error", error.message); // Emit error to the client
      }
    });

    socket.on('messages', async (data) => {
      try {
        const { conversationId, userId } = data
        const messages = await Message.find({ conversationId, isDeleted: false }).sort({ createdAt: 1 })

        io.to(userId.toString()).emit('messages', messages);

      } catch (error) {
        console.log(error)
        socket.emit("error", error.message); // Emit error to the client
      }
    })

    socket.on('message', async (data) => {
      try {
        const { conversationId, sender, text } = JSON.parse(data);
    
        const findConversation = await Conversation.findOne({ _id: conversationId }).select({ participants: 1 });
    
        const opponentId = findConversation.participants.filter(participant => participant.toString() !== sender.toString());
    
        // Create new message
        const messageCreate = await Message.create({
          conversationId,
          sender,
          text
        });
    
        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            sender,
            content: text,
            timestamp: new Date(),
            seen: []
          },
          updatedAt: new Date() // Ensure sorting works properly
        });
    
        // Fetch the latest updated conversation
        const updatedConversation = await Conversation.findById(conversationId);
    
        // Emit message to both users
        [sender, opponentId[0]].forEach(id => {
          io.to(id.toString()).emit('message', messageCreate);
          io.to(id.toString()).emit('updateConversation', updatedConversation); // Send the latest conversation
        });
    
      } catch (error) {
        socket.emit('error', error.message);
      }
    });
    


    // Handle socket disconnection
    socket.on("disconnect", () => {
    });
  });
};

export default Chat;

// socket.on("markAsRead", async ({ userId, conversationId }) => {
//   try {
//     if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(conversationId)) {
//       return socket.emit("error", { message: "Invalid ID" });
//     }

//     const id = new mongoose.Types.ObjectId(userId);
//     const convId = new mongoose.Types.ObjectId(conversationId);

//     const updatedMessages = await Message.updateMany(
//       {
//         conversation: convId,
//         receiver: id,
//         isRead: false,
//       },
//       {
//         $set: { isRead: true, readAt: new Date() },
//       }
//     );

//     if (updatedMessages.modifiedCount > 0) {
//       const messages = await Message.find({ conversation: convId });
//       const participants = [...new Set(messages.flatMap((msg) => [msg.sender.toString(), msg.receiver.toString()]))];
//       participants.forEach((user) => {
//         io.to(user).emit("messagesRead", {
//           conversationId,
//           readAt: new Date(),
//         });
//         io.to(user).emit("getConversations");
//       });
//     }
//   } catch (error) {
//     console.error("Error marking messages as read:", error);
//     socket.emit("error", { message: "Failed to mark messages as read" });
//   }
// });