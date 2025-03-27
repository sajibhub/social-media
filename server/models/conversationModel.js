import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    type: {
        type: String,
        enum: ["group", "private"],
        required: true
    },
    lastMessage: {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        content: {
            type: String,
        },
        timestamp: {
            type: Date,
        },
        seen: {
            type: Boolean,
            default: false
        }
    }
},
    { timestamps: true, versionKey: false }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);

export default Conversation;
