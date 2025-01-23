import validator from "validator"
import mongoose from "mongoose";
import Notification from "../models/notificationModel.js"

export const NotificationGet = async (req, res) => {
    try {
        const { id } = req.headers

        const notification = await Notification.aggregate([
            { $match: { userId: id } },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "sourceId",
                    foreignField: "_id",
                    as: "user",
                },
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
                                    format: "%H:%M:%S %Y-%m-%d",
                                    date: "$createdAt",
                                    timezone: "Asia/Dhaka",
                                },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    sourceId: 1,
                    type: 1,
                    postId: 1,
                    isRead: 1,
                    time:1,
                    user: {
                        fullName: 1,
                        username: 1,
                        profile: 1,
                    },
                },
            },
        ]);

        return res.status(200).json({
            notification
        })
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while processing your request."
        })
    }
}

export const NotificationRead = async (req, res) => {
    try {
        if (!validator.isMongoId(req.params.notificationId)) {
            return res.status(400).json({ message: "Invalid notification ID" });
        }
        const { id } = req.headers
        const notificationId = new mongoose.Types.ObjectId(req.params.notificationId)
        const notificationFind = await Notification.findOne({ _id: notificationId }).select({ _id: 0, userId: 1 })
        if (!notificationFind) {
            return res.status(404).json(
                { message: "Notification not found" }
            );
        }
        if (notificationFind.userId.toString() != id.toString()) {
            return res.status(400).json({
                message: "Notification read access denied"
            })
        }

        const notification = await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true })
        return res.status(200).json({
            message: "Notification marked as read successfully"
        })
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while processing your request."
        })
    }
}

export const NotificationAllRead = async (req, res) => {
    try {

        const { id } = req.headers;

        const AllRead = await Notification.updateMany({ userId: id }, { isRead: true })
        return res.status(200).json({
            message: "All Notifications Marked as Read Successfully",
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "An error occurred while processing your request."
        })
    }
}

export const NotificationClear = async (req, res) => {
    try {
        if (!validator.isMongoId(req.params.notificationId)) {
            return res.status(400).json({ message: "Invalid notification ID" });
        }
        const { id } = req.headers
        const notificationId = new mongoose.Types.ObjectId(req.params.notificationId)
        const notificationFind = await Notification.findOne({ _id: notificationId }).select({ _id: 0, userId: 1 })
        if (!notificationFind) {
            return res.status(404).json(
                { message: "Notification not found" }
            );
        }
        if (notificationFind.userId.toString() != id.toString()) {
            return res.status(400).json({
                message: "Notification read access denied"
            })
        }

        const notification = await Notification.findByIdAndDelete(notificationId)
        return res.status(200).json({
            message: "Notification deleted successfully"
        })

    } catch (error) {
        message: "An error occurred while processing your request."
    }
}

export const NotificationAllClear = async (req, res) => {
    try {
        const { id } = req.headers;
        const AllClear = await Notification.deleteMany({ userId: id })
        return res.status(200).json({
            message: "All Notifications deleted successfully",
        })
    } catch (error) {
        res.status(500).json({
            message: "An error occurred while processing your request."
        })
    }
}