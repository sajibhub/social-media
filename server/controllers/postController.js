import mongoose from "mongoose";
import multer from "multer";
import validator from "validator";

import Post from "../models/postModel.js";
import storage from "../utils/cloudinary.js";
import User from "../models/userModel.js";

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
  const { username } = req.params;
  const userFind = await User.findOne({ username });

  try {
    const post = await Post.aggregate([
      {
        $match: {
          userId: userFind?._id,
        },
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
                      { $subtract: [new Date(), "$createdAt"] },
                      1000 * 60,
                    ],
                  },
                  1440,
                ],
              },
              then: {
                $cond: {
                  if: {
                    $lt: [
                      {
                        $divide: [
                          { $subtract: [new Date(), "$createdAt"] },
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
                              { $subtract: [new Date(), "$createdAt"] },
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
                              { $subtract: [new Date(), "$createdAt"] },
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
                                  { $subtract: [new Date(), "$createdAt"] },
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
          isLike: {
            $in: [id, { $ifNull: ["$likes", []] }],
          },
          myPost: {
            $eq: [id, "$userId"],
          },
        },
      },
      {
        $addFields: {
          isFollowing: {
            $cond: {
              if: { $ne: [id, "$userId"] },
              then: {
                $cond: {
                  if: { $in: [id, { $ifNull: ["$followers", []] }] },
                  then: true,
                  else: false,
                },
              },
              else: "$$REMOVE",
            },
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
          like: { $size: { $ifNull: ["$likes", []] } },
          comment: { $size: { $ifNull: ["$comments", []] } },
          view: { $size: { $ifNull: ["$view", []] } },
          isLike: 1,
          myPost: 1,
          postSave: { $size: { $ifNull: ["$postSave", []] } },
        },
      },
    ]);

    return res.status(200).json({
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
    if (!validator.isMongoId(postId)) {
      return res.status(400).json({ message: "Invalid Post ID." });
    }

    const postId = new mongoose.Types.ObjectId(req.params.postId);
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
    if (!validator.isMongoId(req.params.postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const postId = new mongoose.Types.ObjectId(req.params.postId);
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
    if (!validator.isMongoId(req.params.postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const postId = new mongoose.Types.ObjectId(req.params.postId);
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

    return res.status(200).json({
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
    if (!validator.isMongoId(req.params.postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const postId = new mongoose.Types.ObjectId(req.params.postId);
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

export const PostCommentView = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.postId)) {
      return res.status(400).json({ message: "Invalid Post ID." });
    }

    const postId = new mongoose.Types.ObjectId(req.params.postId);
    const { id } = req.headers;

    const findPost = await Post.findById(postId);
    if (!findPost) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    const comments = await Post.aggregate([
      {
        $match: { _id: postId },
      },

      {
        $unwind: "$comments",
      },
      {
        $sort: { "comments.time": -1 },
      },

      {
        $lookup: {
          from: "users",
          localField: "comments.userId",
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
                      { $subtract: [new Date(), "$comments.time"] },
                      1000 * 60,
                    ],
                  },
                  1440,
                ],
              },
              then: {
                $cond: {
                  if: {
                    $lt: [
                      {
                        $divide: [
                          { $subtract: [new Date(), "$comments.time"] },
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
                              { $subtract: [new Date(), "$comments.time"] },
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
                              { $subtract: [new Date(), "$comments.time"] },
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
                                  { $subtract: [new Date(), "$comments.time"] },
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
                          date: "$comments.time",
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
                  date: "$comments.time",
                  timezone: "Asia/Dhaka",
                },
              },
            },
          },
        },
      },

      {
        $project: {
          comment: "$comments.comment",
          _id: "$comments._id",
          isComment: {
            $cond: {
              if: { $eq: ["$comments.userId", id] },
              then: true,
              else: false,
            },
          },
          "user.username": 1,
          "user.fullName": 1,
          "user.profile": 1,
          time: 1,
        },
      },
    ]);

    res.status(200).json({
      comments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const PostCommentUpdate = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    if (!validator.isMongoId(req.params.commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

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
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request",
    });
  }
};

export const PostCommentDelete = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    if (!validator.isMongoId(req.params.commentId)) {
      return res.status(400).json({ message: "Invalid comment ID" });
    }

    const postId = new mongoose.Types.ObjectId(req.params.postId);
    const commentId = new mongoose.Types.ObjectId(req.params.commentId);
    const { id } = req.headers;

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
      if (comment._id.toString() != commentId.toString()) {
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

export const PostSave = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const { id } = req.headers;
    const postId = new mongoose.Types.ObjectId(req.params.postId);

    if (!postId) {
      return res.status(400).json({
        message: "Please provide a post ID.",
      });
    }

    const findPost = await Post.findById(postId);
    if (!findPost) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }
    const UserFind = await User.findById(id);
    if (UserFind.postSave.toString().includes(postId.toString())) {
      await Post.findByIdAndUpdate(
        postId,
        {
          $pull: { postSave: id },
        },
        { new: true }
      );

      await User.findByIdAndUpdate(
        id,
        {
          $pull: { postSave: postId },
        },
        { new: true }
      );

      return res.status(200).json({
        message: "Post unsaved successfully.",
      });
    }

    await Post.findByIdAndUpdate(
      postId,
      {
        $push: { postSave: id },
      },
      { new: true }
    );
    await User.findByIdAndUpdate(
      id,
      {
        $push: { postSave: postId },
      },
      { new: true }
    );
    return res.status(200).json({
      message: "Post save successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while saving your request.",
    });
  }
};
