import mongoose from "mongoose"
import { io } from "../app.js"
import Conversations from "../models/conversionsModel.js"
import Message from "../models/messageModel.js"

const socketControllers = () => {


    io.on("connection", (socket) => {
       
        try {
            const userId = socket.handshake.query.id;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                console.error("Invalid user ID received:", userId);
                socket.emit("error", { message: "Invalid user ID" });
                return;
            }

            const id = new mongoose.Types.ObjectId(userId);

            socket.on('getConversations', async () => {
                try {
                    const conversations = await Conversations.aggregate([
                        {
                            $match: { participants: id }
                        },
                        {
                            $addFields: {
                                opponentId: {
                                    $arrayElemAt: [
                                        { $setDifference: ["$participants", [id]] },
                                        0
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "users",
                                localField: "opponentId",
                                foreignField: "_id",
                                as: "opponents"
                            }
                        },
                        {
                            $addFields: {
                                opponent: {
                                    $arrayElemAt: [
                                        {
                                            $filter: {
                                                input: "$opponents",
                                                as: "opponent",
                                                cond: { $ne: ["$$opponent._id", id] }
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
                                opponentId: "$opponent._id",
                                fullName: "$opponent.fullName",
                                username: "$opponent.username",
                                profile: "$opponent.profile",
                            }
                        }
                    ]);
                    socket.emit("getConversations", conversations);
                } catch (error) {

                }
            });



            socket.on("sendMessage", async (message) => {
                try {
                    const JsonMessage = JSON.parse(message);
                    const receiver = new mongoose.Types.ObjectId(JsonMessage.receiver);
                    let conversationId = new mongoose.Types.ObjectId(socket.handshake.query.conversationId);

                    const findConversation = await Conversations.findOne({ _id: conversationId });

                    if (!findConversation) {
                        const newConversation = await Conversations.create({
                            participants: [id, receiver],
                            messageId: []
                        });

                        conversationId = newConversation._id;
                    }

                    const newMessage = await Message.create({
                        sender: id,
                        receiver,
                        text: JsonMessage.text,
                        image: JsonMessage.image
                    });

                    await Conversations.findByIdAndUpdate(conversationId, {
                        $push: { messageId: newMessage._id }
                    }, { new: true });

                    io.emit(socket.handshake.query.conversationId, {
                        sender: id,
                        receiver,
                        text: JsonMessage.text,
                        image: JsonMessage.image,
                        time: newMessage.createdAt,
                    });

                } catch (error) {
                    console.error("Error processing message:", error);
                }

            })



            socket.on('getMessage', async () => {
                const conversationId = socket.handshake.query.conversationId
                try {
                    let messageId = await Conversations.findOne({ _id: conversationId })
                    const getMessage = await Message.find({ _id: { $in: messageId.messageId } })
                    socket.emit(conversationId, getMessage)
                } catch (error) {

                }
            })

            socket.on('disconnect', () => {
            });

        } catch (error) {
            console.error("Error in socket connection:", error);
            socket.emit("error", { message: "Socket connection error" });
        }
    });

}

export default socketControllers;


