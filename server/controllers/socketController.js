import mongoose from "mongoose";
import { io } from "../app.js";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

const activeUsers = {}; // Maps userId to socket.id

const Chat = () => {
  io.on("connection", (socket) => {
    socket.on("join", async (userId) => {
      if (userId) {
        activeUsers[userId] = socket.id;
        socket.join(userId.toString());
        await User.findByIdAndUpdate(userId, { lastActive: new Date() });
        io.emit("active", Object.keys(activeUsers));
      }
    });

    socket.on("conversationCreated", async (data) => {
      try {
        const { senderId, receiverId } = data;
        const existingConversation = await Conversation.findOne({
          participants: { $all: [senderId, receiverId] },
        }).lean();

        let conversation = existingConversation;
        if (!conversation) {
          conversation = await Conversation.create({
            participants: [senderId, receiverId],
            type: "private",
          });
        }

        const populatedConversation = await Conversation.findById(conversation._id)
          .populate("participants", "fullName profile lastActive")
          .lean();

        [senderId, receiverId].forEach((userId) =>
          io.to(userId.toString()).emit("conversationCreated", populatedConversation)
        );
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("getConversation", async (data) => {
      try {
        const { userId } = data;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        const conversations = await Conversation.aggregate([
          { $match: { participants: userObjectId } },
          {
            $lookup: {
              from: "users",
              let: { participantIds: "$participants" },
              pipeline: [
                { $match: { $expr: { $in: ["$_id", "$$participantIds"] } } },
                { $project: { _id: 1, username: 1, fullName: 1, profile: 1, lastActive: 1 } },
              ],
              as: "participantDetails",
            },
          },
          {
            $lookup: {
              from: "messages",
              localField: "_id",
              foreignField: "conversationId",
              as: "messages",
            },
          },
          {
            $addFields: {
              unseen: {
                $size: {
                  $filter: {
                    input: "$messages",
                    cond: {
                      $and: [
                        { $eq: ["$$this.seen", false] },
                        { $ne: ["$$this.sender", userObjectId] },
                      ],
                    },
                  },
                },
              },
              participant: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$participantDetails",
                      cond: { $ne: ["$$this._id", userObjectId] },
                    },
                  },
                  0,
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              type: 1,
              lastMessage: 1,
              updatedAt: 1,
              participants: 1,
              participant: 1,
              unseen: 1,
            },
          },
          { $sort: { "lastMessage.timestamp": -1, updatedAt: -1 } },
        ]);

        io.to(userId.toString()).emit("getConversation", conversations);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("messages", async (data) => {
      try {
        const { conversationId, userId } = data;
        const messages = await Message.find({ conversationId })
          .sort({ createdAt: 1 })
          .lean();
        io.to(userId.toString()).emit("messages", messages);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("message", async (data) => {
      try {
        const parsedData = JSON.parse(data);
        const { conversationId, sender, text, replyTo } = parsedData;

        if (!conversationId || !sender || !text) {
          throw new Error("Missing required fields");
        }

        const conversation = await Conversation.findById(conversationId)
          .populate("participants", "fullName profile lastActive")
          .lean();
        if (!conversation) throw new Error("Conversation not found");

        const opponentId = conversation.participants.find(
          (p) => p._id.toString() !== sender.toString()
        )?._id;

        const replyToData = replyTo && replyTo.id && replyTo.message
          ? { id: replyTo.id, message: replyTo.message }
          : null;

        const newMessage = await Message.create({
          conversationId,
          sender,
          text,
          replyTo: replyToData,
          seen: false,
          createdAt: new Date(),
        });

        const updatedConversation = await Conversation.findByIdAndUpdate(
          conversationId,
          {
            lastMessage: {
              sender,
              content: text,
              timestamp: new Date(),
              seen: false,
            },
            updatedAt: new Date(),
          },
          { new: true }
        )
          .populate("participants", "fullName profile lastActive")
          .lean();

        const unseenSender = await Message.countDocuments({
          conversationId,
          sender: { $ne: sender },
          seen: false,
        });
        const unseenReceiver = await Message.countDocuments({
          conversationId,
          sender: { $eq: sender },
          seen: false,
        });

        const userIds = [sender, opponentId].filter(Boolean);
        userIds.forEach((id) => {
          io.to(id.toString()).emit("message", newMessage.toObject());
          io.to(id.toString()).emit("updateConversation", updatedConversation);
          io.to(id.toString()).emit("unseen", {
            unseen: id === sender ? unseenSender : unseenReceiver,
            conversationId,
          });
        });
      } catch (error) {
        socket.emit("error", { message: error.message || "Failed to process message" });
      }
    });

    socket.on("seen", async (data) => {
      try {
        const { conversationId, senderId, messageId } = data;
        const messageIds = Array.isArray(messageId) ? messageId : [messageId];

        const conversation = await Conversation.findById(conversationId)
          .populate("participants", "fullName profile lastActive")
          .lean();
        if (!conversation) throw new Error("Conversation not found");

        const receiverId = conversation.participants.find(
          (p) => p._id.toString() !== senderId
        )?._id;

        await Message.updateMany(
          { conversationId, _id: { $in: messageIds }, seen: false },
          { $set: { seen: true } }
        );

        const updatedConversation = await Conversation.findByIdAndUpdate(
          conversationId,
          { $set: { "lastMessage.seen": true } },
          { new: true }
        )
          .populate("participants", "fullName profile lastActive")
          .lean();

        const unseenSender = await Message.countDocuments({
          conversationId,
          sender: { $ne: senderId },
          seen: false,
        });
        const unseenReceiver = await Message.countDocuments({
          conversationId,
          sender: { $eq: senderId },
          seen: false,
        });

        [senderId, receiverId].forEach((id) => {
          if (id) {
            io.to(id.toString()).emit("seen", messageIds);
            io.to(id.toString()).emit("updateConversation", updatedConversation);
            io.to(id.toString()).emit("unseen", {
              unseen: id === senderId ? unseenSender : unseenReceiver,
              conversationId,
            });
          }
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    socket.on("editMessage", async (data) => {
      try {
        const { messageId, senderId, newText } = data;

        if (!messageId || !senderId || !newText) {
          throw new Error("Missing required fields");
        }

        const message = await Message.findById(messageId).lean();
        if (!message) throw new Error("Message not found");
        if (message.sender.toString() !== senderId) {
          throw new Error("You can only edit your own messages");
        }

        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { text: newText, isEdited: true, updatedAt: new Date() },
          { new: true }
        ).lean();

        const conversation = await Conversation.findById(updatedMessage.conversationId)
          .populate("participants", "fullName profile lastActive")
          .lean();
        if (!conversation) throw new Error("Conversation not found");

        const opponentId = conversation.participants.find(
          (p) => p._id.toString() !== senderId
        )?._id;

        const latestMessage = await Message.findOne({ conversationId: updatedMessage.conversationId })
          .sort({ createdAt: -1 })
          .lean();
        if (latestMessage._id.toString() === messageId) {
          const updatedConversation = await Conversation.findByIdAndUpdate(
            updatedMessage.conversationId,
            {
              lastMessage: {
                sender: updatedMessage.sender,
                content: newText,
                timestamp: updatedMessage.createdAt,
                seen: updatedMessage.seen,
              },
              updatedAt: new Date(),
            },
            { new: true }
          )
            .populate("participants", "fullName profile lastActive")
            .lean();

          const userIds = [senderId, opponentId].filter(Boolean);
          userIds.forEach((id) => {
            io.to(id.toString()).emit("messageEdited", updatedMessage);
            io.to(id.toString()).emit("updateConversation", updatedConversation);
          });
        } else {
          const userIds = [senderId, opponentId].filter(Boolean);
          userIds.forEach((id) => {
            io.to(id.toString()).emit("messageEdited", updatedMessage);
          });
        }
      } catch (error) {
        socket.emit("error", { message: error.message || "Failed to edit message" });
      }
    });

    socket.on("deleteMessage", async (data) => {
      try {
        const { messageId, senderId } = data;
    
        if (!messageId || !senderId) {
          throw new Error("Missing required fields");
        }
    
        const message = await Message.findById(messageId).lean();
        if (!message) throw new Error("Message not found");
        if (message.sender.toString() !== senderId) {
          throw new Error("You can only delete your own messages");
        }
    
        // Update the message to mark it as deleted instead of removing it
        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          { isDeleted: true, updatedAt: new Date() },
          { new: true }
        ).lean();
    
        const conversation = await Conversation.findById(message.conversationId)
          .populate("participants", "fullName profile lastActive")
          .lean();
        if (!conversation) throw new Error("Conversation not found");
    
        const opponentId = conversation.participants.find(
          (p) => p._id.toString() !== senderId
        )?._id;
    
        // Update the conversation's lastMessage if the deleted message was the latest
        const latestMessage = await Message.findOne({ 
          conversationId: message.conversationId,
          isDeleted: false // Only consider non-deleted messages
        })
          .sort({ createdAt: -1 })
          .lean();
        
        const updatedConversation = await Conversation.findByIdAndUpdate(
          message.conversationId,
          {
            lastMessage: latestMessage
              ? {
                  sender: latestMessage.sender,
                  content: latestMessage.text,
                  timestamp: latestMessage.createdAt,
                  seen: latestMessage.seen,
                }
              : null,
            updatedAt: new Date(),
          },
          { new: true }
        )
          .populate("participants", "fullName profile lastActive")
          .lean();
    
        const unseenSender = await Message.countDocuments({
          conversationId: message.conversationId,
          sender: { $ne: senderId },
          seen: false,
          isDeleted: false, // Only count non-deleted messages
        });
        const unseenReceiver = await Message.countDocuments({
          conversationId: message.conversationId,
          sender: { $eq: senderId },
          seen: false,
          isDeleted: false, // Only count non-deleted messages
        });
    
        const userIds = [senderId, opponentId].filter(Boolean);
        userIds.forEach((id) => {
          io.to(id.toString()).emit("messageDeleted", { messageId, isDeleted: true }); // Updated event payload
          io.to(id.toString()).emit("updateConversation", updatedConversation);
          io.to(id.toString()).emit("unseen", {
            unseen: id === senderId ? unseenSender : unseenReceiver,
            conversationId: message.conversationId,
          });
        });
      } catch (error) {
        socket.emit("error", { message: error.message || "Failed to delete message" });
      }
    });
    
    
    socket.on("disconnect", async () => {
      const userId = Object.keys(activeUsers).find((id) => activeUsers[id] === socket.id);
      if (userId) {
        delete activeUsers[userId];
        await User.findByIdAndUpdate(userId, { lastActive: new Date() });
        io.emit("active", Object.keys(activeUsers));
      }
    });
  });
};

export default Chat;