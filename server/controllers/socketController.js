import mongoose from "mongoose";
import { io } from "../app.js";
import Message from "../models/messageModel.js";

const socketControllers = () => {
    io.on("connection", (socket) => {
        const userId = socket.handshake.query.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error("Invalid user ID received:", userId);
            socket.emit("error", { message: "Invalid user ID" });
            return;
        }

        const id = new mongoose.Types.ObjectId(userId);

        socket.on("getConversations", async () => {
            try {
                const messages = await Message.aggregate([
                    {
                        $match: {
                            $or: [
                                { sender: id },
                                { receiver: id }
                            ]
                        }
                    },
                    {
                        $group: {
                            _id: {
                                $cond: {
                                    if: { $gte: [{ $cmp: ["$sender", "$receiver"] }, 0] },
                                    then: { sender: "$sender", receiver: "$receiver" },
                                    else: { sender: "$receiver", receiver: "$sender" }
                                }
                            },
                            lastMessage: { $last: "$$ROOT" }
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "_id.receiver",
                            foreignField: "_id",
                            as: "receiverData",
                        }
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "_id.sender",
                            foreignField: "_id",
                            as: "senderData",
                        }
                    },
                    {
                        $addFields: {
                            receiver: { $arrayElemAt: ["$receiverData", 0] },
                            sender: { $arrayElemAt: ["$senderData", 0] },
                            lastMessageText: "$lastMessage.text",
                            lastMessageTime: "$lastMessage.createdAt",
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            conversationId: { $concat: [{ $toString: "$_id.sender" }, "-", { $toString: "$_id.receiver" }] },
                            fullName: { $ifNull: ["$receiver.fullName", "$sender.fullName"] },
                            username: { $ifNull: ["$receiver.username", "$sender.username"] },
                            profile: { $ifNull: ["$receiver.profile", "$sender.profile"] },
                            lastMessageText: 1,
                            lastMessageTime: 1,
                        }
                    }
                ]);

                socket.emit("getConversations", messages);
            } catch (error) {
                console.error("Error fetching conversations:", error);
                socket.emit("error", { message: "Failed to load conversations" });
            }
        });

        socket.on("sendMessage", async (message) => {
            try {
                console.log(message);
                const { receiver, text, image } = JSON.parse(message);
                const sender = id; 
        
                if (!receiver || !text) {
                    console.error("Sender or receiver is missing or message is empty.");
                    return;
                }
        
                const conversationId = [sender, receiver].sort().join("-");
        
                const newMessage = await Message.create({
                    sender,
                    receiver,
                    text,
                    image,
                    conversationId, 
                });
        
                io.emit(receiver, {
                    sender: sender,
                    receiver: receiver,
                    text: newMessage.text,
                    image: newMessage.image,
                    time: newMessage.createdAt,
                    conversationId,
                });
        
                io.emit(sender, {
                    sender: sender,
                    receiver: receiver,
                    text: newMessage.text,
                    image: newMessage.image,
                    time: newMessage.createdAt,
                    conversationId,
                });
        
            } catch (error) {
                console.error("Error sending message:", error);
            }
        });
        
        
        socket.on("markAsRead", async (conversationId) => {
            try {
                await Message.updateMany(
                    { conversationId, isRead: false },
                    { $set: { isRead: true } }
                );
                io.emit(conversationId, { status: "read" });
            } catch (error) {
                console.error("Error marking messages as read:", error);
            }
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", userId);
        });
    });
};

export default socketControllers;
