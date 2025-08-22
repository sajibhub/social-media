import mongoose from "mongoose";
import multer from "multer";
import validator from "validator";

import Post from "../models/postModel.js";
import storage from "../utils/cloudinary.js";
import User from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import { io } from "../app.js";
import postTime from "../utils/postTime.js";

export const PostCreate = async (req, res) => {
  try {
    const { id } = req.headers;
    const upload = multer({ storage });
    
    // Wrap multer middleware in a promise to handle it properly
    await new Promise((resolve, reject) => {
      upload.single("image")(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

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

    await Post.create({
      userId: id,
      caption,
      images,
    });
    
    return res.status(201).json({
      message: "Post created successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const PostRead = async (req, res) => {
  try {
    const { id } = req.headers;
    const { username } = req.params;
    const objectId = new mongoose.Types.ObjectId(id);

    const userFind = await User.findOne({ username });
    if (!userFind) {
      return res.status(404).json({ message: "User not found" });
    }

    const post = await Post.aggregate([
      { $match: { userId: userFind._id } },
      { $sort: { createdAt: -1 } },

      // Join user info
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },

      // Add computed fields
      {
        $addFields: {
          time: {
            $let: {
              vars: { diffMinutes: { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 1000 * 60] } },
              in: {
                $cond: [
                  { $lt: ["$$diffMinutes", 1440] },
                  {
                    $cond: [
                      { $lt: ["$$diffMinutes", 60] },
                      { $concat: [{ $toString: { $floor: "$$diffMinutes" } }, " minutes ago"] },
                      {
                        $concat: [
                          { $toString: { $floor: { $divide: ["$$diffMinutes", 60] } } },
                          " hours ago"
                        ]
                      }
                    ]
                  },
                  { $dateToString: { format: "%d-%b-%Y", date: "$createdAt", timezone: "Asia/Dhaka" } }
                ]
              }
            }
          },

          isLike: { $in: [objectId, { $ifNull: ["$likes", []] }] },
          myPost: { $eq: [objectId, "$userId"] },
          isFollowing: {
            $cond: [
              { $ne: [objectId, "$userId"] },
              { $in: [objectId, { $ifNull: ["$user.followers", []] }] },
              "$$REMOVE"
            ]
          },
          isSave: { $in: [objectId, { $ifNull: ["$postSave", []] }] },
        },
      },

      // Project fields
      {
        $project: {
          _id: 1,
          user: {
            _id: 1,
            fullName: 1,
            username: 1,
            profile: 1,
            verify: 1,
          },
          caption: 1,
          images: 1,
          time: 1,
          likes: { $size: { $ifNull: ["$likes", []] } },
          comment: { $size: { $ifNull: ["$comments", []] } },
          view: { $size: { $ifNull: ["$view", []] } },
          postSave: { $size: { $ifNull: ["$postSave", []] } },
          isLike: 1,
          myPost: 1,
          isFollowing: 1,
          isSave: 1,
        },
      },
    ]);

    return res.status(200).json({ post });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const PostUpdate = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.postId)) {
      return res.status(400).json({ message: "Invalid Post ID." });
    }

    const postId = new mongoose.Types.ObjectId(req.params.postId);
    const { id } = req.headers;
    const { caption } = req.body;

    if (!postId) {
      return res.status(400).json({
        message: "Post ID is required"
      });
    }

    const findPost = await Post.findById(postId).select({ userId: 1 });
    if (!findPost) {
      return res.status(404).json({ message: "Post not found." });
    }
    
    if (findPost.userId.toString() !== id.toString()) {
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
    
    return res.status(200).json({
      message: "Post updated successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
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

    if (!postId) {
      return res.status(400).json({
        message: "Post ID is required"
      });
    }

    const findPost = await Post.findById(postId).select({ userId: 1, likes: 1, postSave: 1 });
    if (!findPost) {
      return res.status(404).json({ message: "Post not found." });
    }

    if (findPost.userId.toString() !== id.toString()) {
      return res.status(403).json({ message: "Post deleted access denied" });
    }

    await User.updateMany(
      { postSave: { $in: [postId] } },
      { $pull: { postSave: postId } },
      { new: true }
    );

    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found." });
    }

    return res.status(200).json({ message: "Post deleted successfully." });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      message: "An error occurred while processing your request.", 
      error: error.message 
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

    if (!postId) {
      return res.status(400).json({
        message: "Post ID is required"
      });
    }

    const findPost = await Post.findById(postId);

    if (!findPost) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }
    
    if (findPost.likes.includes(id)) {
      await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: id } },
        { new: true }
      );
      return res.status(200).json({
        message: "Post unliked successfully.",
      });
    }

    await Post.findByIdAndUpdate(
      postId,
      { $push: { likes: id } },
      { new: true }
    );

    const userId = await User.findOne({ _id: findPost.userId }).select({ _id: 1 });
    
    if (id.toString() !== findPost.userId.toString()) {
      const create = await Notification.create({
        userId: userId._id,
        type: "like",
        sourceId: id,
        postId,
      });
      
      const user = await User.findOne({ _id: id }).select({ fullName: 1, username: 1, profile: 1, verify: 1 });

      const data = {
        _id: create._id,
        userId: userId._id,
        sourceId: id,
        postId,
        time: postTime(create.createdAt),
        type: "like",
        isRead: false,
        user
      };
      
      io.to(userId._id.toString()).emit('notification', data);
    }
    
    return res.status(200).json({
      message: "Post liked successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const PostLikeRead = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const postId = new mongoose.Types.ObjectId(req.params.postId);

    if (!postId) {
      return res.status(400).json({
        message: "Post ID is required"
      });
    }

    const findPost = await Post.findById(postId);
    if (!findPost) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    const likeUserFind = await Post.aggregate([
      {
        $match: { _id: postId },
      },
      {
        $lookup: {
          from: "users",
          localField: "likes",
          foreignField: "_id",
          as: "likedUsers",
        },
      },
      {
        $unwind: "$likedUsers",
      },
      {
        $project: {
          _id: 0,
          fullName: "$likedUsers.fullName",
          username: "$likedUsers.username",
          profile: "$likedUsers.profile",
          verify: "$likedUsers.verify",
        },
      },
    ]);

    return res.status(200).json({
      user: likeUserFind,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while processing your request",
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

    if (!postId) {
      return res.status(400).json({
        message: "Post ID is required"
      });
    }

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
    
    await Post.findByIdAndUpdate(
      postId,
      { $push: { comments: { comment, userId: id } } },
      { new: true }
    );

    const userId = await User.findOne({ _id: findPost.userId }).select({ _id: 1 });
    const user = await User.findOne({ _id: id }).select({ fullName: 1, username: 1, profile: 1, verify: 1 });
    
    if (id.toString() !== findPost.userId.toString()) {
      const comment = await Notification.create({
        userId: userId._id,
        type: "comment",
        sourceId: id,
        postId,
      });
      
      const data = {
        _id: comment._id,
        userId: userId._id,
        sourceId: id,
        postId,
        time: postTime(comment.createdAt),
        type: "comment",
        isRead: false,
        user
      };
      
      io.to(userId._id.toString()).emit('notification', data);
    }

    return res.status(200).json({
      message: "Comment added successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
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

    if (!postId) {
      return res.status(400).json({
        message: "Post ID is required"
      });
    }

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
              if: { $eq: [{ $toString: "$comments.userId" }, id] },
              then: true,
              else: false,
            },
          },
          user: {
            fullName: 1,
            username: 1,
            profile: 1,
            verify: 1,
          },
          time: 1,
        },
      },
    ]);

    return res.status(200).json({
      comments,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
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
        message: "Please provide a comment and post ID.",
      });
    }
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
    
    const commentExists = findPost.comments.find((comment) => {
      return comment._id.toString() === commentId.toString();
    });
    
    if (!commentExists) {
      return res.status(404).json({ message: "Comment not found." });
    }
    
    if (commentExists.userId.toString() !== id.toString()) {
      return res.status(401).json({ message: "You are not authorized to update this comment." });
    }
    
    await Post.findByIdAndUpdate(
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
    console.error(error);
    return res.status(500).json({
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
      return comment._id.toString() === commentId.toString();
    });
    
    if (!commentExists) {
      return res.status(404).json({ message: "Comment not found." });
    }
    
    if (commentExists.userId.toString() !== id.toString()) {
      return res.status(401).json({ message: "You are not authorized to delete this comment." });
    }

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
    
    return res.status(200).json({
      message: "Comment deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
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
    if (UserFind.postSave.includes(postId)) {
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
    return res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const SinglePost = async (req, res) => {
  try {
    const { id } = req.headers;
    if (!validator.isMongoId(req.params.postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const postId = new mongoose.Types.ObjectId(req.params.postId);
    if (!postId) {
      return res.status(400).json({ message: "Please provide a post ID." });
    }
    
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const findPost = await Post.aggregate([
      {
        $match: {
          _id: postId,
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
        }
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
                },
              },
              else: {
                $dateToString: {
                  format: "%d-%b-%Y",
                  date: "$createdAt",
                  timezone: "Asia/Dhaka",
                },
              },
            },
          },
          isLike: { $in: [new mongoose.Types.ObjectId(id), "$likes"] },
          myPost: { $eq: [new mongoose.Types.ObjectId(id), "$userId"] },
          isFollowing: {
            $cond: {
              if: { $ne: [new mongoose.Types.ObjectId(id), "$userId"] },
              then: { $in: [new mongoose.Types.ObjectId(id), "$user.followers"] },
              else: "$$REMOVE",
            },
          },
          isSave: { $in: [new mongoose.Types.ObjectId(id), "$postSave"] },
        },
      },

      {
        $project: {
          _id: 1,
          user: {
            fullName: 1,
            username: 1,
            profile: 1,
            verify: 1,
          },
          caption: 1,
          images: 1,
          time: 1,
          likes: { $size: "$likes" },
          comment: { $size: "$comments" },
          view: { $size: "$view" },
          postSave: { $size: "$postSave" },
          isLike: 1,
          myPost: 1,
          isFollowing: 1,
          isSave: 1,
        },
      },
    ]);

    return res.status(200).json(findPost);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};