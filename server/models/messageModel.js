import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    trim: true
  },
  image: {
    url: String,
    filename: String,
    originalName: String,
    size: Number
  },
  file: {
    url: String,
    filename: String,
    originalName: String,
    size: Number,
    type: String
  },
  voiceNote: {
    url: String,
    filename: String,
    duration: Number,
    size: Number
  },
  reactions: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    emoji: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  seen: {
    type: Boolean,
    default: false
  },
  seenBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    seenAt: {
      type: Date,
      default: Date.now
    }
  }],
  seenAt: {
    type: Date
  },
  replyTo: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    message: {
      type: String,
      default: null
    }
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  versionKey: false
});

// Index for better performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ "reactions.userId": 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;