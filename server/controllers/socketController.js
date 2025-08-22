import mongoose from "mongoose";
import { io } from "../app.js";
import Conversation from "../models/conversationModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

const activeUsers = {};
const typingTimers = {};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp3|wav|m4a/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

const Chat = () => {
  io.on("connection", async (socket) => {
    const id = socket.handshake.headers.id; // client should send user ID in headers
    // Validate user ID
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      socket.emit("error", { message: "Invalid user ID" });
      socket.disconnect();
      return;
    }

    const userObjectId = new mongoose.Types.ObjectId(id);

    try {
      const user = await User.findById(userObjectId);
      if (!user) {
        socket.emit("error", { message: "User not found" });
        socket.disconnect();
        return;
      }

      activeUsers[id] = socket.id;

      await User.findByIdAndUpdate(userObjectId, {
        lastActive: new Date(),
        isOnline: true
      });

      socket.join(id.toString());

      io.emit("online", { id });
      socket.emit("onlineUsers", Object.keys(activeUsers));
    } catch (error) {
      console.error("Connection error:", error);
      socket.emit("error", { message: "Connection error" });
      socket.disconnect();
      return;
    }




    // Get all users for chat (optimized with pagination)
    socket.on("getChatUsers", async (data = { page: 1, limit: 20, search: "" }) => {
      try {
        const { page = 1, limit = 20, search = "" } = data;
        const skip = (page - 1) * limit;

        // Convert active user IDs to ObjectId for comparison
        const activeUserIds = Object.keys(activeUsers).map(userId =>
          new mongoose.Types.ObjectId(userId)
        );

        const users = await User.aggregate([
          {
            $match: {
              _id: { $ne: userObjectId },
              $or: [
                { fullName: { $regex: search, $options: "i" } },
                { username: { $regex: search, $options: "i" } }
              ]
            }
          },
          {
            $project: {
              _id: 1,
              fullName: 1,
              username: 1,
              profile: 1,
              isOnline: 1,
              lastActive: 1
            }
          },
          { $skip: skip },
          { $limit: limit },
          {
            $addFields: {
              isActive: { $in: ["$_id", activeUserIds] }
            }
          }
        ]);
        socket.emit("chatUsers", users);
      } catch (error) {
        console.error("Get chat users error:", error);
        socket.emit("error", { message: "Failed to fetch users" });
      }
    });

    socket.on("conversationCreated", async (data) => {
      try {
        const { receiverId } = data;
        if (!receiverId || !mongoose.Types.ObjectId.isValid(receiverId)) {
          socket.emit("error", { message: "Invalid receiver ID" });
          return;
        }
        const receiverObjectId = new mongoose.Types.ObjectId(receiverId);

        // Check if conversation already exists
        const existingConversation = await Conversation.findOne({
          participants: { $all: [userObjectId, receiverObjectId] },
          type: "private"
        }).lean();

        let conversation = existingConversation;
        if (!conversation) {
          conversation = await Conversation.create({
            participants: [userObjectId, receiverObjectId],
            type: "private",
          });
        }

        // Get minimal conversation data
        const minimalConversation = await Conversation.aggregate([
          { $match: { _id: conversation._id } },
          {
            $lookup: {
              from: "users",
              localField: "participants",
              foreignField: "_id",
              as: "participantDetails",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    profile: 1,
                    lastActive: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              participant: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$participantDetails",
                      as: "participant",
                      cond: { $ne: ["$$participant._id", userObjectId] }
                    }
                  },
                  0
                ]
              }
            }
          },
          {
            $project: {
              _id: 1,
              type: 1,
              lastMessage: 1,
              updatedAt: 1,
              participant: 1,
              unseen: 0 // Will be updated separately
            }
          }
        ]);

        if (minimalConversation.length > 0) {
          const convData = minimalConversation[0];
          // Get sender user data
          const senderData = await User.findById(userObjectId).select("username fullName profile lastActive");

          // Emit to both users with minimal data
          io.to(id.toString()).emit("newConversation", convData);
          io.to(receiverId.toString()).emit("newConversation", {
            ...convData,
            participant: senderData
          });
        }
      } catch (error) {
        console.error("Conversation creation error:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("getConversation", async () => {
      try {
        const conversations = await Conversation.aggregate([
          { $match: { participants: userObjectId } },
          {
            $lookup: {
              from: "users",
              localField: "participants",
              foreignField: "_id",
              as: "participantDetails",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    profile: 1,
                    lastActive: 1
                  }
                }
              ]
            }
          },
          {
            $lookup: {
              from: "messages",
              localField: "_id",
              foreignField: "conversationId",
              as: "messages",
              pipeline: [
                {
                  $match: {
                    isDeleted: { $ne: true },
                    seen: false
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              unseen: {
                $size: {
                  $filter: {
                    input: "$messages",
                    as: "msg",
                    cond: {
                      $and: [
                        { $eq: ["$$msg.seen", false] },
                        { $ne: ["$$msg.sender", userObjectId] }
                      ]
                    }
                  }
                }
              },
              participant: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$participantDetails",
                      as: "participant",
                      cond: { $ne: ["$$participant._id", userObjectId] }
                    }
                  },
                  0
                ]
              }
            }
          },
          {
            $project: {
              _id: 1,
              type: 1,
              lastMessage: 1,
              updatedAt: 1,
              participant: 1,
              unseen: 1
            }
          },
          { $sort: { "lastMessage.timestamp": -1, updatedAt: -1 } }
        ]);
        socket.emit("getConversation", conversations);
      } catch (error) {
        console.error("Get conversation error:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("messages", async (data) => {
      try {
        const { conversationId, page = 1, limit = 50 } = data;
        if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
          socket.emit("error", { message: "Invalid conversation ID" });
          return;
        }
        const skip = (page - 1) * limit;
        const messages = await Message.find({
          conversationId: new mongoose.Types.ObjectId(conversationId),
          isDeleted: { $ne: true }
        })
          .select("_id sender text seen createdAt replyTo isEdited image file voiceNote reactions")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        // Reverse to get chronological order
        const sortedMessages = messages.reverse();
        socket.emit("messages", { messages: sortedMessages, page, hasMore: messages.length === limit });
      } catch (error) {
        console.error("Messages error:", error);
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("message", async (data) => {
      try {
        const { conversationId, text, replyTo } = data;
        if (!conversationId || !text) {
          throw new Error("Missing required fields");
        }
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
          throw new Error("Invalid conversation ID");
        }

        const conversation = await Conversation.findById(conversationId)
          .populate("participants", "_id")
          .lean();

        if (!conversation) throw new Error("Conversation not found");

        const opponent = conversation.participants.find(
          (p) => p._id.toString() !== id.toString()
        );

        if (!opponent) throw new Error("Opponent not found in conversation");

        const replyToData = replyTo && replyTo.id && replyTo.message
          ? {
            id: new mongoose.Types.ObjectId(replyTo.id),
            message: replyTo.message
          }
          : null;

        const newMessage = await Message.create({
          conversationId: new mongoose.Types.ObjectId(conversationId),
          sender: userObjectId,
          text,
          replyTo: replyToData,
          seen: false,
          createdAt: new Date(),
        });

        // Update conversation with minimal lastMessage data
        await Conversation.findByIdAndUpdate(
          conversationId,
          {
            lastMessage: {
              sender: userObjectId,
              content: text.length > 50 ? text.substring(0, 47) + "..." : text,
              timestamp: new Date(),
              seen: false,
            },
            updatedAt: new Date(),
          }
        );

        // Get minimal message data for emission
        const messageData = {
          _id: newMessage._id,
          conversationId: newMessage.conversationId,
          sender: newMessage.sender,
          text: newMessage.text,
          replyTo: newMessage.replyTo,
          seen: newMessage.seen,
          createdAt: newMessage.createdAt,
          isEdited: newMessage.isEdited,
          reactions: newMessage.reactions || []
        };

        // Emit to both users
        io.to(id.toString()).emit("message", messageData);
        io.to(opponent._id.toString()).emit("message", messageData);

        // Update conversation list for both users (only unseen count)
        const unseenCount = await Message.countDocuments({
          conversationId: new mongoose.Types.ObjectId(conversationId),
          seen: false,
          isDeleted: { $ne: true },
          sender: userObjectId
        });

        // For sender: no unseen messages
        io.to(id.toString()).emit("updateConversationUnseen", {
          conversationId,
          unseen: 0
        });

        // For receiver: increment unseen count
        io.to(opponent._id.toString()).emit("updateConversationUnseen", {
          conversationId,
          unseen: unseenCount
        });
      } catch (error) {
        console.error("Message error:", error);
        socket.emit("error", { message: error.message || "Failed to process message" });
      }
    });

    socket.on("typingStart", async (data) => {
      try {
        const { conversationId } = data;
        if (!conversationId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Add user to typing list
        const typingUser = {
          userId: userObjectId,
          username: user?.username || "Unknown",
          startedAt: new Date()
        };

        const isAlreadyTyping = conversation.typingUsers.some(
          user => user.userId.toString() === id
        );

        if (!isAlreadyTyping) {
          conversation.typingUsers.push(typingUser);
          await conversation.save();

          // Emit to all participants except the sender
          conversation.participants.forEach(participantId => {
            if (participantId.toString() !== id) {
              io.to(participantId.toString()).emit("userTyping", {
                conversationId,
                userId: id,
                username: user?.username || "Unknown"
              });
            }
          });
        }

        // Clear previous timer
        if (typingTimers[`${id}_${conversationId}`]) {
          clearTimeout(typingTimers[`${id}_${conversationId}`]);
        }

        // Set new timer to auto-stop typing
        typingTimers[`${id}_${conversationId}`] = setTimeout(async () => {
          socket.emit("typingStop", { conversationId });
        }, 3000);
      } catch (error) {
        console.error("Typing start error:", error);
      }
    });

    socket.on("typingStop", async (data) => {
      try {
        const { conversationId } = data;
        if (!conversationId) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;

        // Remove user from typing list
        conversation.typingUsers = conversation.typingUsers.filter(
          user => user.userId.toString() !== id
        );
        await conversation.save();

        // Clear timer
        if (typingTimers[`${id}_${conversationId}`]) {
          clearTimeout(typingTimers[`${id}_${conversationId}`]);
          delete typingTimers[`${id}_${conversationId}`];
        }

        // Emit to all participants except the sender
        conversation.participants.forEach(participantId => {
          if (participantId.toString() !== id) {
            io.to(participantId.toString()).emit("userStopTyping", {
              conversationId,
              userId: id
            });
          }
        });
      } catch (error) {
        console.error("Typing stop error:", error);
      }
    });

    socket.on("seen", async (data) => {
      try {
        const { conversationId } = data;
        if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
          throw new Error("Invalid conversation ID");
        }

        const conversation = await Conversation.findById(conversationId)
          .populate("participants", "_id")
          .lean();

        if (!conversation) throw new Error("Conversation not found");

        const opponent = conversation.participants.find(
          (p) => p._id.toString() !== id
        );

        if (!opponent) throw new Error("Opponent not found");

        // Mark messages as seen
        await Message.updateMany(
          {
            conversationId: new mongoose.Types.ObjectId(conversationId),
            sender: opponent._id,
            seen: false
          },
          { $set: { seen: true, seenAt: new Date() } }
        );

        // Update conversation last message seen status
        await Conversation.findByIdAndUpdate(
          conversationId,
          { $set: { "lastMessage.seen": true } }
        );

        // Emit to both users
        io.to(id.toString()).emit("messagesSeen", { conversationId });
        io.to(opponent._id.toString()).emit("messagesSeen", { conversationId });

        // Update conversation list for both users
        io.to(id.toString()).emit("updateConversationUnseen", {
          conversationId,
          unseen: 0
        });
      } catch (error) {
        console.error("Seen error:", error);
        socket.emit("error", { message: "Failed to mark messages as read" });
      }
    });

    // Optimized edit message handler
    socket.on("editMessage", async (data) => {
      try {
        const { messageId, newText } = data;
        if (!messageId || !newText) {
          throw new Error("Missing required fields");
        }

        const message = await Message.findById(messageId).lean();
        if (!message) throw new Error("Message not found");

        if (message.sender.toString() !== userObjectId.toString()) {
          throw new Error("You can only edit your own messages");
        }

        const updatedMessage = await Message.findByIdAndUpdate(
          messageId,
          {
            text: newText,
            isEdited: true,
            updatedAt: new Date()
          },
          { new: true }
        ).select("_id text isEdited updatedAt conversationId").lean();

        // Emit to all participants in the conversation
        const conversation = await Conversation.findById(message.conversationId)
          .populate("participants", "_id")
          .lean();

        if (conversation) {
          conversation.participants.forEach(participant => {
            io.to(participant._id.toString()).emit("messageEdited", updatedMessage);
          });
        }
      } catch (error) {
        console.error("Edit message error:", error);
        socket.emit("error", { message: error.message || "Failed to edit message" });
      }
    });

    // Optimized delete message handler
    socket.on("deleteMessage", async (data) => {
      try {
        const { messageId } = data;
        if (!messageId) {
          throw new Error("Missing message ID");
        }

        const message = await Message.findById(messageId).lean();
        if (!message) throw new Error("Message not found");

        if (message.sender.toString() !== userObjectId.toString()) {
          throw new Error("You can only delete your own messages");
        }

        // Soft delete the message
        await Message.findByIdAndUpdate(
          messageId,
          {
            isDeleted: true,
            deletedAt: new Date(),
            text: "This message was deleted"
          }
        );

        // Emit to all participants in the conversation
        const conversation = await Conversation.findById(message.conversationId)
          .populate("participants", "_id")
          .lean();

        if (conversation) {
          conversation.participants.forEach(participant => {
            io.to(participant._id.toString()).emit("messageDeleted", {
              messageId,
              isDeleted: true
            });
          });
        }
      } catch (error) {
        console.error("Delete message error:", error);
        socket.emit("error", { message: error.message || "Failed to delete message" });
      }
    });

    // Message reactions
    socket.on("messageReaction", async (data) => {
      try {
        const { messageId, emoji } = data;
        if (!messageId || !emoji) {
          throw new Error("Missing required fields");
        }

        const message = await Message.findById(messageId);
        if (!message) throw new Error("Message not found");

        // Check if user already reacted with this emoji
        const existingReactionIndex = message.reactions.findIndex(
          reaction => reaction.userId.toString() === id && reaction.emoji === emoji
        );

        if (existingReactionIndex > -1) {
          // Remove reaction
          message.reactions.splice(existingReactionIndex, 1);
        } else {
          // Remove any existing reaction from this user
          message.reactions = message.reactions.filter(
            reaction => reaction.userId.toString() !== id
          );
          // Add new reaction
          message.reactions.push({
            userId: userObjectId,
            emoji,
            createdAt: new Date()
          });
        }

        await message.save();

        // Get conversation participants
        const conversation = await Conversation.findById(message.conversationId);
        if (!conversation) throw new Error("Conversation not found");

        // Emit to all participants
        conversation.participants.forEach(participantId => {
          io.to(participantId.toString()).emit("messageReaction", {
            messageId,
            reactions: message.reactions,
            userId: id,
            emoji,
            action: existingReactionIndex > -1 ? "removed" : "added"
          });
        });
      } catch (error) {
        console.error("Message reaction error:", error);
        socket.emit("error", { message: error.message || "Failed to react to message" });
      }
    });

    // File upload handler
    socket.on("uploadFile", async (data) => {
      try {
        const { conversationId, file, fileName, fileType } = data;
        if (!conversationId || !file || !fileName) {
          throw new Error("Missing required fields");
        }

        // Validate conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");

        // Check if user is participant
        const isParticipant = conversation.participants.some(
          p => p.toString() === id
        );
        if (!isParticipant) throw new Error("Not a conversation participant");

        // Create uploads directory if it doesn't exist
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const uniqueName = `${uuidv4()}${path.extname(fileName)}`;
        const filePath = path.join(uploadDir, uniqueName);

        // Write file to disk
        fs.writeFileSync(filePath, Buffer.from(file));

        // Create file URL
        const fileUrl = `/uploads/${uniqueName}`;

        // Create message with file
        const newMessage = await Message.create({
          conversationId: new mongoose.Types.ObjectId(conversationId),
          sender: userObjectId,
          [fileType === 'image' ? 'image' : 'file']: {
            url: fileUrl,
            filename: uniqueName,
            originalName: fileName,
            size: file.size,
            type: fileType
          },
          seen: false,
          createdAt: new Date(),
        });

        // Update conversation
        await Conversation.findByIdAndUpdate(
          conversationId,
          {
            lastMessage: {
              sender: userObjectId,
              content: `Sent a ${fileType}`,
              timestamp: new Date(),
              seen: false,
            },
            updatedAt: new Date(),
          }
        );

        // Emit to all participants
        conversation.participants.forEach(participantId => {
          io.to(participantId.toString()).emit("message", newMessage);
        });
      } catch (error) {
        console.error("File upload error:", error);
        socket.emit("error", { message: error.message || "Failed to upload file" });
      }
    });

    // Voice message handler
    socket.on("uploadVoice", async (data) => {
      try {
        const { conversationId, audioBlob, duration } = data;
        if (!conversationId || !audioBlob) {
          throw new Error("Missing required fields");
        }

        // Validate conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) throw new Error("Conversation not found");

        // Check if user is participant
        const isParticipant = conversation.participants.some(
          p => p.toString() === id
        );
        if (!isParticipant) throw new Error("Not a conversation participant");

        // Create voice directory if it doesn't exist
        const voiceDir = 'uploads/voice/';
        if (!fs.existsSync(voiceDir)) {
          fs.mkdirSync(voiceDir, { recursive: true });
        }

        // Generate unique filename
        const uniqueName = `voice_${uuidv4()}.webm`;
        const filePath = path.join(voiceDir, uniqueName);

        // Write audio file to disk
        fs.writeFileSync(filePath, Buffer.from(audioBlob));

        // Create audio URL
        const audioUrl = `/uploads/voice/${uniqueName}`;

        // Create message with voice note
        const newMessage = await Message.create({
          conversationId: new mongoose.Types.ObjectId(conversationId),
          sender: userObjectId,
          voiceNote: {
            url: audioUrl,
            filename: uniqueName,
            duration: duration,
            size: audioBlob.size
          },
          seen: false,
          createdAt: new Date(),
        });

        // Update conversation
        await Conversation.findByIdAndUpdate(
          conversationId,
          {
            lastMessage: {
              sender: userObjectId,
              content: "Voice message",
              timestamp: new Date(),
              seen: false,
            },
            updatedAt: new Date(),
          }
        );

        // Emit to all participants
        conversation.participants.forEach(participantId => {
          io.to(participantId.toString()).emit("message", newMessage);
        });
      } catch (error) {
        console.error("Voice message error:", error);
        socket.emit("error", { message: error.message || "Failed to send voice message" });
      }
    });

    // Group chat creation
    socket.on("createGroup", async (data) => {
      try {
        const { name, participants, description, image } = data;
        if (!name || !participants || participants.length < 2) {
          throw new Error("Group name and at least 2 participants required");
        }

        // Convert participant IDs to ObjectId
        const participantIds = participants.map(p => new mongoose.Types.ObjectId(p));

        // Create group conversation
        const groupConversation = await Conversation.create({
          participants: [userObjectId, ...participantIds],
          name,
          description,
          image,
          type: "group",
          admins: [userObjectId]
        });

        // Emit to all participants
        groupConversation.participants.forEach(participantId => {
          io.to(participantId.toString()).emit("groupCreated", groupConversation);
        });
      } catch (error) {
        console.error("Group creation error:", error);
        socket.emit("error", { message: error.message || "Failed to create group" });
      }
    });

    // Message search
    socket.on("searchMessages", async (data) => {
      try {
        const { conversationId, query, page = 1, limit = 20 } = data;
        if (!query) {
          throw new Error("Search query required");
        }

        const skip = (page - 1) * limit;
        let searchCriteria = {
          text: { $regex: query, $options: "i" },
          isDeleted: { $ne: true }
        };

        if (conversationId) {
          searchCriteria.conversationId = new mongoose.Types.ObjectId(conversationId);
        }

        const messages = await Message.find(searchCriteria)
          .select("_id sender text createdAt conversationId")
          .populate("sender", "username fullName profile")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();

        socket.emit("searchResults", {
          messages,
          query,
          page,
          hasMore: messages.length === limit
        });
      } catch (error) {
        console.error("Message search error:", error);
        socket.emit("error", { message: error.message || "Failed to search messages" });
      }
    });

    socket.on("disconnect", async () => {
      try {
        if (id && activeUsers[id]) {
          delete activeUsers[id];

          Object.keys(typingTimers).forEach(key => {
            if (key.startsWith(`${id}_`)) {
              clearTimeout(typingTimers[key]);
              delete typingTimers[key];
            }
          });

          // Update user status to offline
          if (userObjectId) {
            await User.findByIdAndUpdate(
              userObjectId,
              {
                lastActive: new Date(),
                isOnline: false
              }
            );
          }

          io.emit("offline", { id });
        }
      } catch (error) {
        console.error("Disconnect error:", error);
      }
    });
  });
};

export default Chat;