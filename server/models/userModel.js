import mongoose from "mongoose";

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
    },
    phone: {
      type: String,
      unique: true,
      trim: true,
      
    },
    password: {
      type: String,
    },
    googleId: {
      type: String,
      default: null,
    },
    githubId: {
      type: String,
      default: null,
    },
    facebookId: {
      type: String,
      default: null,
    },
    provider: { type: String },
    otp: {
      code: {
        type: String,
        default: "0",
      },
      expired: {
        type: Date,
        default: Date.now,
      },
    },
    profile: {
      type: String,
    },
    cover: {
      type: String,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    postSave: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
    bio: {
      type: String,
      default: "",
    },
    mediaLink: {
      facebook: {
        type: String,
        default: null,
      },
      linkedin: {
        type: String,
        default: null,
      },
      fiver: {
        type: String,
        default: null,
      },
      github: {
        type: String,
        default: null,
      },
    },
    status: {
      type: Boolean,
      default: false,
    },
    verify: {
      type: Boolean,
      default: false,
    },
    visitorId: {
      type: String,
      default: null,
    },
    profession: {
      type: String,
      default: "Explorer"
    },
    location: {
      type: String,
      default: "",
    },
    lastLogin: {
      type: Number,
      default: new Date(),
    },
    lastActive: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model("User", UserSchema);
export default User;
