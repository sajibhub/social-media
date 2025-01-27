import mongoose from "mongoose";

const storySchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    image: {
      type: String,
    },
    text: {
      type: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: []
      },
    ],
    views: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        default: []
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Story = mongoose.model("story", storySchema);
export default Story;
