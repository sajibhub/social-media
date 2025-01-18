import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";

import Post from "../models/postModel.js";

const app = express();

export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});


io.on("connection", async (socket) => {
  console.log("Connection established");
  
  // io.use(async (socket, next) => {
  //   try {
  //     const { token } = socket.handshake.headers.cookie;
  
  //     if (!token) {
  //       return next(new Error("Unauthorized"));
  //     }
  
  //     const decoded = jwt.verify(token, process.env.JWT_SECRET);
  //     if (!decoded) {
  //       return next(new Error("Unauthorized"));
  //     }
  
  //     const user = await User.findById(decoded.userId);
  //     if (!user) {
  //       return next(new Error("Unauthorized"));
  //     }
  
  //     socket.user = user; 
  //     console.log(user)
  //     next();
  
  //   } catch (error) {
  //     return next(new Error("Unauthorized"));
  //   }
  // });
  Post.watch().on("change", async (change) => {
    const posts = await Post.find({});
    socket.emit("posts", posts);
  });
  const id = "";
  const post = await Post.aggregate([
    {
      $match: {}, // Optional filtering criteria
    },
    {
      $sort: { createdAt: -1 }, // Sort posts by newest
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
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "comments.userId",
        foreignField: "_id",
        as: "commentUsers",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "likes", // Directly use the `likes` array of user IDs
        foreignField: "_id",
        as: "likeUsers", // Get user details for all user IDs in `likes`
      },
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
        comments: {
          $map: {
            input: {
              $sortArray: {
                input: "$comments",
                sortBy: { time: -1 }, // Sort comments by `time`
              },
            },
            as: "comment",
            in: {
              _id: "$$comment._id",
              comment: "$$comment.comment",
              userId: "$$comment.userId",
              time: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $lt: [
                          {
                            $divide: [
                              {
                                $subtract: [new Date(), "$$comment.time"], // Use `time`
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
                                    $subtract: [new Date(), "$$comment.time"], // Use `time`
                                  },
                                  1000 * 60,
                                ],
                              },
                            },
                          },
                          " minutes ago",
                        ],
                      },
                    },
                    {
                      case: {
                        $lt: [
                          {
                            $divide: [
                              {
                                $subtract: [new Date(), "$$comment.time"], // Use `time`
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
                                    $subtract: [new Date(), "$$comment.time"], // Use `time`
                                  },
                                  1000 * 60 * 60,
                                ],
                              },
                            },
                          },
                          " hours ago",
                        ],
                      },
                    },
                  ],
                  default: {
                    $dateToString: {
                      format: "%H:%M:%S %Y-%m-%d",
                      date: "$$comment.time", // Use `time`
                      timezone: "Asia/Dhaka",
                    },
                  },
                },
              },
              user: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$commentUsers",
                      as: "user",
                      cond: { $eq: ["$$user._id", "$$comment.userId"] },
                    },
                  },
                  0,
                ],
              },
            },
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
        save: { $size: { $ifNull: ["$postSave", []] } },
        comments: {
          _id: 1,
          comment: 1,
          userId: 1,
          time: 1,
          user: {
            fullName: 1,
            username: 1,
            profile: 1,
          },
        },
        likes: {
          $map: {
            input: "$likeUsers",
            as: "likeUser",
            in: {
              fullName: "$$likeUser.fullName",
              username: "$$likeUser.username",
              profile: "$$likeUser.profile",
            },
          },
        },
      },
    },
  ]);

  socket.emit("posts", post);

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
