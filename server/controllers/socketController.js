// socketControllers.js
import mongoose from "mongoose";
import { io } from "../app.js";
import Message from "../models/messageModel.js";

const totalUsers = {};

const socketControllers = () => {
  const updateUsers = () => {
    Object.keys(totalUsers).forEach((userId) => {
      const userList = Object.keys(totalUsers).filter((id) => id !== userId);
      io.to(userId).emit("userList", userList);
    });
  };

  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      if (!userId) {
        socket.emit("error", { message: "User ID required" });
        return socket.disconnect();
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error("Invalid user ID:", userId);
        socket.emit("error", { message: "Invalid user authentication" });
        return socket.disconnect();
      }

      totalUsers[userId] = socket.id;
      socket.join(userId);
      updateUsers();
      console.log(`User ${userId} joined`);
    });

    socket.on("getConversations", async (userId) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return socket.emit("error", { message: "Invalid user ID" });
        }

        const id = new mongoose.Types.ObjectId(userId);

        const conversations = await Message.aggregate([
          {
            $match: {
              $or: [{ sender: id }, { receiver: id }],
              isDeleted: false,
            },
          },
          {
            $group: {
              _id: "$conversation",
              lastMessage: { $last: "$$ROOT" },
            },
          },
          {
            $lookup: {
              from: "users",
              let: {
                otherUser: {
                  $cond: [
                    { $eq: ["$lastMessage.sender", id] },
                    "$lastMessage.receiver",
                    "$lastMessage.sender",
                  ],
                },
              },
              pipeline: [
                { $match: { $expr: { $eq: ["$_id", "$$otherUser"] } } },
                { $project: { fullName: 1, username: 1, profile: 1 } },
              ],
              as: "contactData",
            },
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
                        { $eq: ["$isDeleted", false] },
                      ],
                    },
                  },
                },
                { $count: "count" },
              ],
              as: "unreadMessages",
            },
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
                _id: "$lastMessage._id",
                text: "$lastMessage.text",
                image: "$lastMessage.image",
                time: "$lastMessage.createdAt",
                sender: "$lastMessage.sender",
                isRead: "$lastMessage.isRead",
                readAt: "$lastMessage.readAt",
              },
              unreadCount: {
                $ifNull: [{ $arrayElemAt: ["$unreadMessages.count", 0] }, 0],
              },
            },
          },
          { $sort: { "lastMessage.time": -1 } },
        ]);

        socket.emit("conversations", conversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        socket.emit("error", { message: "Failed to load conversations" });
      }
    });

    socket.on("sendPrivateMessage", async (data) => {
      try {
        const { senderId, receiverId, text, image } = JSON.parse(data);

        if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
          return socket.emit("error", { message: "Invalid user ID" });
        }

        if (!text && !image) {
          return socket.emit("error", { message: "Message must contain text or image" });
        }

        const sender = new mongoose.Types.ObjectId(senderId);
        const receiver = new mongoose.Types.ObjectId(receiverId);

        // Check for an existing conversation between sender and receiver
        const existingMessage = await Message.findOne({
          $or: [
            { sender, receiver },
            { sender: receiver, receiver: sender },
          ],
          isDeleted: false,
        });

        // Use existing conversationId if found, otherwise create a new one
        const conversationId = existingMessage
          ? existingMessage.conversation
          : new mongoose.Types.ObjectId();

        const newMessage = await Message.create({
          conversation: conversationId,
          sender,
          receiver,
          text: text || undefined,
          image: image || undefined,
          isRead: false,
          isDeleted: false,
          readAt: null,
        });

        const messageData = {
          _id: newMessage._id,
          sender: sender.toString(),
          receiver: receiver.toString(),
          text: newMessage.text,
          image: newMessage.image,
          time: newMessage.createdAt,
          conversationId: conversationId.toString(),
          isRead: newMessage.isRead,
          readAt: newMessage.readAt,
          isDeleted: newMessage.isDeleted,
        };

        io.to(receiverId).emit("newMessage", messageData);
        [senderId, receiverId].forEach((userId) => {
          io.to(userId).emit("getConversations");
        });
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    socket.on("getChatHistory", async ({ userId, contactId }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(contactId)) {
          return socket.emit("error", { message: "Invalid user ID" });
        }

        const id = new mongoose.Types.ObjectId(userId);
        const contact = new mongoose.Types.ObjectId(contactId);

        const messages = await Message.find({
          $or: [
            { sender: id, receiver: contact },
            { sender: contact, receiver: id },
          ],
          isDeleted: { $ne: true },
        })
          .sort({ createdAt: 1 })
          .limit(50);

        if (messages.length === 0) {
          return socket.emit("chatHistory", { conversationId: null, messages: [] });
        }

        const conversationId = messages[0].conversation;

        socket.emit("chatHistory", {
          conversationId: conversationId.toString(),
          messages: messages.map((msg) => ({
            _id: msg._id,
            sender: msg.sender.toString(),
            receiver: msg.receiver.toString(),
            text: msg.text,
            image: msg.image,
            time: msg.createdAt,
            isRead: msg.isRead,
            readAt: msg.readAt,
            conversationId: msg.conversation.toString(),
            isDeleted: msg.isDeleted,
          })),
        });
      } catch (error) {
        console.error("Error fetching chat history:", error);
        socket.emit("error", { message: "Failed to load chat history" });
      }
    });

    socket.on("markAsRead", async ({ userId, conversationId }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(conversationId)) {
          return socket.emit("error", { message: "Invalid ID" });
        }

        const id = new mongoose.Types.ObjectId(userId);
        const convId = new mongoose.Types.ObjectId(conversationId);

        const updatedMessages = await Message.updateMany(
          {
            conversation: convId,
            receiver: id,
            isRead: false,
          },
          {
            $set: { isRead: true, readAt: new Date() },
          }
        );

        if (updatedMessages.modifiedCount > 0) {
          const messages = await Message.find({ conversation: convId });
          const participants = [...new Set(messages.flatMap((msg) => [msg.sender.toString(), msg.receiver.toString()]))];
          participants.forEach((user) => {
            io.to(user).emit("messagesRead", {
              conversationId,
              readAt: new Date(),
            });
            io.to(user).emit("getConversations");
          });
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    socket.on("deleteMessage", async ({ userId, messageId }) => {
      try {
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(messageId)) {
          return socket.emit("error", { message: "Invalid ID" });
        }

        const id = new mongoose.Types.ObjectId(userId);
        const message = await Message.findOneAndUpdate(
          { _id: messageId, sender: id },
          { $set: { isDeleted: true } },
          { new: true }
        );

        if (!message) {
          return socket.emit("error", { message: "Message not found or unauthorized" });
        }

        const messages = await Message.find({ conversation: message.conversation });
        const participants = [...new Set(messages.flatMap((msg) => [msg.sender.toString(), msg.receiver.toString()]))];
        participants.forEach((user) => {
          io.to(user).emit("messageDeleted", {
            messageId,
            conversationId: message.conversation.toString(),
          });
          io.to(user).emit("getConversations");
        });
      } catch (error) {
        console.error("Error deleting message:", error);
        socket.emit("error", { message: "Failed to delete message" });
      }
    });

    socket.on("disconnect", () => {
      const userId = Object.keys(totalUsers).find((id) => totalUsers[id] === socket.id);
      if (userId) {
        delete totalUsers[userId];
        updateUsers();
        console.log(`User ${userId} disconnected`);
      }
    });
  });
};

export default socketControllers;