import Post from "../models/postModel.js";


export const SocketPosts = async (socket) => {
  Post.watch().on("change", async (change) => {
    const posts = await Post.find({});
    socket.emit("posts", posts);
  });
  const id = "";
  const post = await Post.aggregate([
    {
      $match: {},
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
        localField: "likes",
        foreignField: "_id",
        as: "likeUsers",
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
                sortBy: { time: -1 },
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
                      date: "$$comment.time",
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
};
