import Post from "../models/postModel.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import mongoose from "mongoose";

export const PostCreate = (req, res) => {
  const { id } = req.headers;

  try {
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_API_KEY,
      api_secret: process.env.CLOUD_API_SECRET,
    });

    const storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "images",
        transformation: [{ width: 1000, height: 800, crop: "limit" }],
        allowed_formats: ["jpg", "png", "jpeg"],
      },
    });

    const upload = multer({ storage });
    upload.single("image")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          message: err.message,
        });
      }
      const { caption } = req.body;
      const file = req.file;

      if (!caption && !file) {
        return res.status(400).json({
          message: "Please provide a caption or an image.",
        });
      }

      let images = null;
      if (file) {
        images = [file.path];
      }

      const post = await Post.create({
        userId: id,
        caption,
        images,
      });
      res.status(201).json({
        message: "Post created successfully.",
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const PostRead = async (req, res) => {
  const { id } = req.headers;
  try {
    const post = await Post.aggregate([
      {
        $match: { userId: id },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $addFields: {
          time: {
            $dateToString: {
              format: "%H:%M:%S %Y-%m-%d ",
              date: {
                $dateSubtract: {
                  startDate: "$createdAt",
                  unit: "minute",
                  amount: 240,
                },
              },
              timezone: "Asia/Dhaka",
            },
          },
        },
      },
      {
        $addFields: {
          liked: {
            $in: [id, "$likes"],
          },
        },
      },
      {
        $project: {
          _id: 1,

          user: {
            fullName: 1,
            username: 1,
            profile: 1,
          },
          caption: 1,
          images: 1,
          time: 1,
          like: { $size: "$likes" },
          comment: { $size: "$comments" },
          view: { $size: "$view" },
          liked: 1,
        },
      },
    ]);

    res.status(200).json({
      post,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const PostUpdate = async (req, res) => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);
    const { id } = req.headers;
    const { caption } = req.body;

    const findPost = await Post.findById(postId).select({ userId: 1 });
    if (findPost?.userId.toString() != id.toString()) {
      return res.status(403).json({
        message: "Post update access denied",
      });
    }
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { caption },
      { new: true }
    );
    if (!updatedPost) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }
    res.status(200).json({
      message: "Post updated successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const PostDelete = async (req, res) => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);
    const { id } = req.headers;

    const findPost = await Post.findById(postId).select({ userId: 1 });
    if (findPost?.userId.toString() != id.toString()) {
      return res.status(403).json({
        message: "Post update access denied",
      });
    }

    const updatedPost = await Post.findByIdAndDelete(postId);

    if (!updatedPost) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    res.status(200).json({
      message: "Post delete successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const PostLike = async (req, res) => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);
    const { id } = req.headers;

    const findPost = await Post.findById(postId);

    if (!findPost) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    if (findPost.likes.toString().includes(id.toString())) {
      const updatedPost = await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: id } },
        { new: true }
      );
      return res.status(200).json({
        message: "Post unliked successfully.",
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { likes: id } },
      { new: true }
    );

    res.status(200).json({
      message: "Post liked successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const PostComment = async (req, res) => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);
    const { id } = req.headers;
    const { comment } = req.body;
    if (!comment) {
      return res.status(400).json({
        message: "Please provide a comment.",
      });
    }
    const findPost = await Post.findById(postId);
    if (!findPost) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: { comment, userId: id } } },
      { new: true }
    );
    res.status(200).json({
      message: "Comment added successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const PostCommentDelete = async (req, res) => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.id);
    const { id } = req.headers;
    const { commentId } = req.params;
    if (!commentId) {
      return res.status(400).json({
        message: "Please provide a comment ID.",
      });
    }
    const findPost = await Post.findById(postId);
    if (!findPost) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }
    const commentExists = findPost.comments.find((comment) => {
      if (comment._id.toString() != commentId) {
        return res.status(404).json({
          message: "Comment not found ",
        });
      }
      if (comment.userId.toString() != id.toString()) {
        return res.status(401).json({
          message: "You are not allowed ",
        });
      }
    });

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $pull: { comments: { _id: commentId, userId: id } } },
      { new: true }
    );
    if (!updatedPost) {
      return res.status(404).json({
        message: "Comment not found or not authorized to delete it.",
      });
    }
    res.status(200).json({
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};
