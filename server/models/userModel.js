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
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    google: {
      id: { type: String },
      name: { type: String },
      email: { type: String },
      profile: { type: String },
    },
    facebook: {
      name: { type: String },
      email: { type: String },
      profile: { type: String },
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
    bio: {
      type: String,
      default: "",
    },
    mediaLink: {
      facebook: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
      fiver: {
        type: String,
        default: "",
      },
      github: {
        type: String,
        default: "",
      },
    },
    likePosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
    status: {
      type: Boolean,
      default: false,
    },
    visitorId: {
      type: String,
      default: null,
    },
    lastLogin: {
      type: Number,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = mongoose.model("User", UserSchema);
export default User;
