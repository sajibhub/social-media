import mongoose from "mongoose";
import multer from "multer";

import Post from "../models/postModel.js";
import storage from "../utils/cloudinary.js";

export const PostCreate = (req, res) => {
  const { id } = req.headers;

  try {
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
            $cond: {
              if: {
                $lt: [
                  {
                    $divide: [
                      {
                        $subtract: [new Date(), "$createdAt"], // Calculate the time difference in milliseconds
                      },
                      1000 * 60, // Convert milliseconds to minutes
                    ],
                  },
                  1440, // Less than 1440 minutes (24 hours)
                ],
              },
              then: {
                $cond: {
                  if: {
                    $lt: [
                      {
                        $divide: [
                          {
                            $subtract: [new Date(), "$createdAt"],
                          },
                          1000 * 60,
                        ],
                      },
                      60,
                    ],
                  },
                  then: {
                    $concat: [
                      {
                        $toString: {
                          $floor: {
                            $divide: [
                              {
                                $subtract: [new Date(), "$createdAt"],
                              },
                              1000 * 60,
                            ],
                          },
                        },
                      },
                      " minutes ago",
                    ],
                  },
                  else: {
                    $cond: {
                      if: {
                        $lt: [
                          {
                            $divide: [
                              {
                                $subtract: [new Date(), "$createdAt"],
                              },
                              1000 * 60 * 60,
                            ],
                          },
                          24,
                        ],
                      },
                      then: {
                        $concat: [
                          {
                            $toString: {
                              $floor: {
                                $divide: [
                                  {
                                    $subtract: [new Date(), "$createdAt"],
                                  },
                                  1000 * 60 * 60,
                                ],
                              },
                            },
                          },
                          " hours ago",
                        ],
                      },
                      else: {
                        $dateToString: {
                          format: "%H:%M:%S %Y-%m-%d",
                          date: "$createdAt",
                          timezone: "Asia/Dhaka",
                        },
                      },
                    },
                  },
                },
              },
              else: {
                $dateToString: {
                  format: "%H:%M:%S %Y-%m-%d",
                  date: "$createdAt",
                  timezone: "Asia/Dhaka",
                },
              },
            },
          },
          liked: {
            $in: [id, "$likes"],
          },
          myPost: {
            $eq: [id, "$userId"],
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
          myPost: 1,
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
      { $set: { caption } },
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

export const PostCommentUpdate = async (req, res) => {
  try {
    const postId = new mongoose.Types.ObjectId(req.params.postId);
    const commentId = new mongoose.Types.ObjectId(req.params.commentId);
    const { id } = req.headers;
    const { comment } = req.body;
    if (!commentId || !postId) {
      return res.status(400).json({
        message: "Please provide a comment and post ID .",
      });
    }
    if (comment == "") {
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
    const commentExists = findPost.comments.find((comment) => {
      if (comment._id.toString() != commentId) {
        return res.status(404).json({
          message: "Comment not found ",
        });
      }
      if (comment.userId.toString() != id.toString()) {
        return res.status(401).json({
          message: "You are not allowed to edit this comment",
        });
      }
    });
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        $set: {
          "comments.$[comment].comment": comment, 
        },
      },
      {
        new: true,
        arrayFilters: [{ "comment._id": commentId }], 
      }
    );
    return res.status(200).json({
      message: "Comment updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request",
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
