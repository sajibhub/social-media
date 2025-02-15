import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        text: {
            type: String,
        },
        image: {
            type: String,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        conversationId: {
            type: String,  // Store the conversationId to group messages between two users
            required: true,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const Message = mongoose.model("Message", MessageSchema);
export default Message;
