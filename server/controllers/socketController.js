// socketControllers.js
import mongoose from "mongoose";
import { io } from "../app.js";
import Message from "../models/messageModel.js";
import Conversation from "../models/conversationModel.js";

const totalUsers = {};
const socketControllers = () => {
  const updateUsers = () => {
    Object.keys(totalUsers).forEach(userId => {
      const userList = Object.keys(totalUsers).filter(id => id !== userId);
      io.to(userId).emit("userList", userList);
    });
  };

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.id;

    if (userId) {
      totalUsers[userId] = socket.id
      updateUsers()
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error("Invalid user ID:", userId);
      socket.emit("error", { message: "Invalid user authentication" });
      return socket.disconnect();
    }

    const id = new mongoose.Types.ObjectId(userId);
    socket.join(userId);

    socket.on("getConversations", async () => {
      try {
        const conversations = await Conversation.aggregate([
          { $match: { participants: id } },
          {
            $lookup: {
              from: "messages",
              localField: "lastMessage",
              foreignField: "_id",
              as: "lastMessageData"
            }
          },
          { $unwind: { path: "$lastMessageData", preserveNullAndEmptyArrays: true } },
          {
            $lookup: {
              from: "users",
              let: {
                otherUser: {
                  $arrayElemAt: [
                    { $filter: { input: "$participants", cond: { $ne: ["$$this", id] } } },
                    0
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
            $lookup: {
              from: "messages",
              let: { convId: "$_id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ["$conversation", "$$convId"] },
                        { $eq: ["$receiver", id] },
                        { $eq: ["$isRead", false] },
                        { $eq: ["$isDeleted", false] }
                      ]
                    }
                  }
                },
                { $count: "count" }
              ],
              as: "unreadMessages"
            }
          },
          {
            $project: {
              _id: 0,
              conversationId: "$_id",
              contactId: "$contactData._id",
              fullName: "$contactData.fullName",
              username: "$contactData.username",
              profile: "$contactData.profile",
              lastMessage: {
                $cond: {
                  if: { $eq: ["$lastMessageData", undefined] },
                  then: null,
                  else: {
                    _id: "$lastMessageData._id",
                    text: "$lastMessageData.text",
                    image: "$lastMessageData.image",
                    time: "$lastMessageData.createdAt",
                    sender: "$lastMessageData.sender",
                    isRead: "$lastMessageData.isRead",
                    readAt: "$lastMessageData.readAt"
                  }
                }
              },
              unreadCount: {
                $arrayElemAt: ["$unreadMessages.count", 0]
              }
            }
          },
          { $sort: { "lastMessage.time": -1 } }
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
        const participants = [sender, receiver].sort();

        let conversation = await Conversation.findOne({ participants: { $all: participants } });

        if (!conversation) {
          conversation = await Conversation.create({ participants, lastMessage: null });
        }

        // Create new message
        const newMessage = await Message.create({
          conversation: conversation._id,
          sender,
          receiver,
          text,
          image,
          isRead: false,
          isDeleted: false,
          readAt: null
        });

        await Conversation.findByIdAndUpdate(
          conversation._id,
          {
            lastMessage: newMessage._id,
            updatedAt: new Date()
          },
          { new: true }
        );

        const messageData = {
          _id: newMessage._id,
          sender: sender.toString(),
          receiver: receiver.toString(),
          text: newMessage.text,
          image: newMessage.image,
          time: newMessage.createdAt,
          conversationId: conversation._id,
          isRead: false,
          readAt: null,
          isDeleted: newMessage.isDeleted
        };

        io.to(receiverId).emit("newMessage", messageData);

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
        const conversation = await Conversation.findOne({
          participants: { $all: [id, contact] }
        });

        if (!conversation) {
          return socket.emit("chatHistory", { conversationId: null, messages: [] });
        }

        const messages = await Message.find({
          conversation: conversation._id,
          isDeleted: { $ne: true }
        })
          .sort({ createdAt: 1 })
          .limit(50);

        socket.emit("chatHistory", {
          conversationId: conversation._id,
          messages: messages.map(msg => ({
            _id: msg._id,
            sender: msg.sender.toString(),
            receiver: msg.receiver.toString(),
            text: msg.text,
            image: msg.image,
            time: msg.createdAt,
            isRead: msg.isRead,
            readAt: msg.readAt,
            conversationId: msg.conversation,
            isDeleted: msg.isDeleted
          }))
        });
      } catch (error) {
        console.error("Error fetching chat history:", error);
        socket.emit("error", { message: "Failed to load chat history" });
      }
    });

    socket.on("markAsRead", async ({ id, conversationId } = JSON.parse(conversations)) => {
      try {
        const updatedMessages = await Message.updateMany(
          {
            conversation: conversationId,
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
          const conversation = await Conversation.findById(conversationId);
          conversation.participants.forEach(user => {
            io.to(user.toString()).emit("messagesRead", {
              conversationId,
              readAt: new Date()
            });
            io.to(user.toString()).emit("getConversations");
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
          { $set: { isDeleted: true } },
          { new: true }
        );

        if (message) {
          const conversation = await Conversation.findById(message.conversation);
          conversation.participants.forEach(user => {
            io.to(user.toString()).emit("messageDeleted", {
              messageId,
              conversationId: message.conversation
            });
            io.to(user.toString()).emit("getConversations");
          });

          const lastMessage = await Message.findOne({
            conversation: message.conversation,
            isDeleted: false
          }).sort({ createdAt: -1 });

          await Conversation.findByIdAndUpdate(
            message.conversation,
            { lastMessage: lastMessage?._id || null },
            { new: true }
          );
        }
      } catch (error) {
        console.error("Error deleting message:", error);
      }
    });

    socket.on("disconnect", () => {
      updateUsers()
    });
  });
};

export default socketControllers;