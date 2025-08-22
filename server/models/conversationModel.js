import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  name: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  type: {
    type: String,
    enum: ["group", "private"],
    required: true,
    default: "private"
  },
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
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
  },
  typingUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String,
    startedAt: Date
  }]
}, {
  timestamps: true,
  versionKey: false
});

// Index for better performance
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ updatedAt: -1 });

const Conversation = mongoose.model("Conversation", ConversationSchema);
export default Conversation;