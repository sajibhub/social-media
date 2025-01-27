import multer from "multer"
import validator from "validator"
import mongoose from "mongoose";
import storage from "../utils/cloudinary.js";
import Story from "../models/storyModel.js";


export const storyCreate = async (req, res) => {
    try {
        const { id } = req.headers
        const upload = multer({ storage })

        upload.single("image")(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    message: err.message
                })
            }
            const { text } = req.body
            const file = req.file

            if (!text && !file) {
                return res.status(400).json({
                    message: "Please provide a caption or an image.",
                });
            }

            let images = null;
            if (file) {
                images = file.path;
            }

            const story = await Story.create({
                userId: id,
                text,
                image: images,
            })

            return res.status(201).json({
                message: "Story created successfully"
            })
        })
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while processing your request"
        })
    }
}

export const storyRead = async (req, res) => {
    try {
        const { id } = req.headers

        const story = await Story.aggregate([
            {
                $match: {
                    views: { $not: { $in: [id] } }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user",
                }
            },
            { $unwind: "$user" },

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
                    isMyStory: { $eq: ["$userId", id] },
                    isLike: { $eq: ["$likes", id] },
                    isFollowing: { $eq: ["$user.followers", id] },
                    rank: {
                        $add: [
                            { $multiply: [{ $size: "$likes" }, 1] },
                            { $multiply: [{ $size: "$views" }, 1] },
                            { $multiply: [{ $cond: [{ $eq: ["$user.userId", id] }, 1, 0] }, 100] }
                        ]
                    }
                }
            },
            { $sort: { rank: -1 } },
            {
                $project: {
                    _id: 1,
                    text: 1,
                    image: 1,
                    views: { $size: "$views" },
                    user: {
                        _id: 1,
                        username: 1,
                        fullName: 1,
                        profile: 1,
                        verify: 1,
                    },
                    isLike: 1,
                    isMyStory: 1,
                    isFollowing: 1,
                    time: 1
                }
            },
            { $limit: 20 },
        ])
        return res.status(200).json({
            stories: story,
        })
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while processing your request."
        })
    }
}

export const storyDeleted = async (req, res) => {
    try {
        if (!validator.isMongoId(req.params.storyId)) {
            return res.status(400).json({ message: "Invalid story ID" });
        }

        const storyId = new mongoose.Types.ObjectId(req.params.storyId);
        const { id } = req.headers;

        if (!storyId) {
            return res.status(400).json({ message: "Story ID is required" });
        }

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }
        if (story.userId.toString() !== id.toString()) {
            return res.status(401).json({ message: "Story deleted access denied" });
        }
        const StoryDelete = await Story.findByIdAndDelete(storyId)
        return res.status(200).json({
            message: "Story deleted successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "An error occurred while processing your request."
        })
    }
}

export const storyViewed = async (req, res) => {
    try {
        if (!validator.isMongoId(req.params.storyId)) {
            return res.status(400).json({ message: "Invalid story ID" });
        }

        const storyId = new mongoose.Types.ObjectId(req.params.storyId);
        const { id } = req.headers;

        if (!storyId) {
            return res.status(400).json({ message: "Story ID is required" });
        }

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }
        if (story.views.includes(id)) {
            return res.status(200).json({
                message: "Story already viewed"
            })
        }

        const viewed = await Story.findByIdAndUpdate(
            storyId,
            { $push: { views: id } },
            { new: true }
        )
        return res.status(200).json({
            message: "Story viewed successfully"
        })

    } catch (error) {
        res.status(500).json({
            message: "An error occurred while processing your request."
        })
    }
}

export const storyLike = async (req, res) => {
    try {
        if (!validator.isMongoId(req.params.storyId)) {
            return res.status(400).json({ message: "Invalid story ID" });
        }

        const storyId = new mongoose.Types.ObjectId(req.params.storyId);
        const { id } = req.headers;

        if (!storyId) {
            return res.status(400).json({ message: "Story ID is required" });
        }

        const story = await Story.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: "Story not found" });
        }
        if (story.likes.includes(id)) {
            return res.status(200).json({
                message: "Story already liked"
            })
        }

        const viewed = await Story.findByIdAndUpdate(
            storyId,
            { $push: { likes: id } },
            { new: true }
        )
        return res.status(200).json({
            message: "Story liked successfully"
        })

    } catch (error) {
        res.status(500).json({
            message: "An error occurred while processing your request."
        })
    }
}
