import mongoose from "mongoose";

const ConversationsSchema = new mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    }],
    messageId: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'messages'
        }
    ]
}, { timestamps: true, versionKey: false });

const Conversations = mongoose.model('Conversations', ConversationsSchema)
export default Conversations;