// socketControllers.js
import mongoose from "mongoose";
import { io } from "../app.js";
import Message from "../models/messageModel.js";

const socketControllers = () => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.id;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid user ID:", userId);
      socket.emit("error", { message: "Invalid user authentication" });
      return socket.disconnect();
    }

    const id = new mongoose.Types.ObjectId(userId);
    socket.join(userId);

    socket.on("getConversations", async () => {
      try {
        const conversations = await Message.aggregate([
          {
            $match: {
              $or: [{ sender: id }, { receiver: id }],
              isDeleted: { $ne: true }
            }
          },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: "$conversationId",
              lastMessage: { $first: "$$ROOT" },
              unreadCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$receiver", id] },
                        { $eq: ["$isRead", false] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              },
              participants: {
                $first: {
                  sender: "$sender",
                  receiver: "$receiver"
                }
              }
            }
          },
          {
            $lookup: {
              from: "users",
              let: {
                otherUser: {
                  $cond: [
                    { $eq: ["$participants.sender", id] },
                    "$participants.receiver",
                    "$participants.sender"
                  ]
                }
              },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$otherUser"] } } },
                { $project: { fullName: 1, username: 1, profile: 1 } }
              ],
              as: "contactData"
            }
          },
          { $unwind: "$contactData" },
          {
            $project: {
              _id: 0,
              conversationId: "$_id",
              contactId: "$contactData._id",
              fullName: "$contactData.fullName",
              username: "$contactData.username",
              profile: "$contactData.profile",
              lastMessage: {
                _id: "$lastMessage._id",
                text: "$lastMessage.text",
                image: "$lastMessage.image",
                time: "$lastMessage.createdAt",
                sender: "$lastMessage.sender",
                isRead: "$lastMessage.isRead",
                readAt: "$lastMessage.readAt"
              },
              unreadCount: 1
            }
          }
        ]);

        socket.emit("conversations", conversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        socket.emit("error", { message: "Failed to load conversations" });
      }
    });

    socket.on("sendPrivateMessage", async (data) => {
        try {
          const { receiverId, text, image } = JSON.parse(data);
          if (!mongoose.Types.ObjectId.isValid(receiverId)) {
            return socket.emit("error", { message: "Invalid recipient" });
          }
      
          const receiver = new mongoose.Types.ObjectId(receiverId);
          const sender = id;
          const conversationId = [sender.toString(), receiver.toString()].sort().join("-");
      
          const newMessage = await Message.create({
            sender,
            receiver,
            text,
            image,
            conversationId,
            isRead: false,
            isDeleted: false,
            readAt: null
          });
      
          const messageData = {
            _id: newMessage._id,
            sender: sender.toString(),
            receiver: receiver.toString(),
            text: newMessage.text,
            image: newMessage.image,
            time: newMessage.createdAt,
            conversationId,
            isRead: false,
            readAt: null
          };
      
          // Emit to both sender and receiver
          socket.emit("newMessage", messageData);
          io.to(receiverId).emit("newMessage", messageData);
      
          // Update conversations for both users
          [sender.toString(), receiver.toString()].forEach(userId => {
            io.to(userId).emit("getConversations");
          });
      
        } catch (error) {
          console.error("Error sending message:", error);
          socket.emit("error", { message: "Failed to send message" });
        }
      });
      

    socket.on("getChatHistory", async ({ contactId }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(contactId)) {
          return socket.emit("error", { message: "Invalid contact" });
        }

        const contact = new mongoose.Types.ObjectId(contactId);
        const conversationId = [id.toString(), contact.toString()].sort().join("-");

        const messages = await Message.find({
          conversationId,
          isDeleted: { $ne: true }
        })
          .sort({ createdAt: 1 })
          .limit(50);

        socket.emit("chatHistory", {
          conversationId,
          messages: messages.map(msg => ({
            _id: msg._id,
            sender: msg.sender.toString(),
            receiver: msg.receiver.toString(),
            text: msg.text,
            image: msg.image,
            time: msg.createdAt,
            isRead: msg.isRead,
            readAt: msg.readAt,
            conversationId: msg.conversationId
          }))
        });
      } catch (error) {
        console.error("Error fetching chat history:", error);
        socket.emit("error", { message: "Failed to load chat history" });
      }
    });

    socket.on("markAsRead", async ({ conversationId }) => {
      try {
        const updatedMessages = await Message.updateMany(
          {
            conversationId,
            receiver: id,
            isRead: false
          },
          { 
            $set: { 
              isRead: true,
              readAt: new Date()
            } 
          }
        );

        if (updatedMessages.modifiedCount > 0) {
          const participants = conversationId.split("-");
          participants.forEach(user => {
            io.to(user).emit("messagesRead", { 
              conversationId,
              readAt: new Date()
            });
            io.to(user).emit("getConversations");
          });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    });

    socket.on("deleteMessage", async ({ messageId }) => {
      try {
        const message = await Message.findOneAndUpdate(
          {
            _id: messageId,
            sender: id
          },
          { isDeleted: true },
          { new: true }
        );

        if (message) {
          const participants = message.conversationId.split("-");
          participants.forEach(user => {
            io.to(user).emit("messageDeleted", {
              messageId,
              conversationId: message.conversationId
            });
            io.to(user).emit("getConversations");
          });
        }
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", userId);
    });
  });
};

export default socketControllers;