import Post from "../models/postModel.js";
import User from "../models/userModel.js";

export const NewsFeed = async (req, res) => {
  try {
    const { id } = req.headers;

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
                  format: "%H:%M:%S %Y-%m-%d",
                  date: "$createdAt",
                  timezone: "Asia/Dhaka",
                },
              },
            },
          },
          isLike: { $in: [id, "$likes"] },
          myPost: { $eq: [id, "$userId"] },
          isFollowing: {
            $cond: {
              if: { $ne: [id, "$userId"] },
              then: { $in: [id, "$user.followers"] },
              else: "$$REMOVE",
            },
          },
          isSave: { $in: [id, "$postSave",] },
          rank: {
            $add: [
              { $multiply: [{ $size: "$likes" }, 1] },
              { $multiply: [{ $size: "$comments" }, 2] },
              { $multiply: [{ $size: "$view" }, 1] },
              {
                $cond: {
                  if: { $in: [id, "$user.followers"] },
                  then: 10,
                  else: 0
                }
              },
              {
                $cond: {
                  if: { $in: [id, "$user.following"] },
                  then: 15,
                  else: 0
                }
              },
              {
                $cond: {
                  if: { $in: [id, '$likes'] },
                  then: { $add: ["$rank", -50] },
                  else: 0
                }
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          user: { _id: 1, fullName: 1, username: 1, profile: 1 },
          caption: 1,
          images: 1,
          time: 1,
          like: { $size: "$likes" },
          comment: { $size: "$comments" },
          view: { $size: "$view" },
          isLike: 1,
          myPost: 1,
          postSave: { $size: "$postSave" },
          isFollowing: 1,
          isSave: 1,
          rank: 1,
        },
      },
      {
        $sort: { rank: -1 },
      },
      {
        $project: {
          rank: 0,
        },
      },
    ]);

    return res.status(200).json({
      post,
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const SuggestUser = async (req, res) => {
  try {
    const { id } = req.headers;

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: id },
          followers: { $not: { $in: [id] } }
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "userId",
          as: "posts"
        }
      },
      {
        $addFields: {
          postCount: { $size: "$posts" },

        }
      },
      {
        $sort: { postCount: -1 },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          username: 1,
          profile: 1,
        }
      }
    ]);

    res.status(200).json(users);

  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};
