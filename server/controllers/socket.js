// import validator from "validator";
// import jwt from 'jsonwebtoken';
// import Post from "../models/postModel.js"; 
// import User from "../models/userModel.js"; 
// import Notification from "../models/notificationModel.js"; 


// export const newsFeed = async (socket) => {
//   try {

//     const { token } = socket.handshake.headers.cookie;
//     if (!token) {
//       throw new Error("No cookies provided");
//     }


//     jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//       if (err) {
//         throw new Error("Invalid token");
//       }

//       socket.user = decoded;
//     });


//     const id = socket.user.userId
//     const post = await Post.aggregate([
//       {
//         $match: {},
//       },
//       {
//         $sort: { createdAt: -1 },
//       },
//       {
//         $lookup: {
//           from: "users",
//           localField: "userId",
//           foreignField: "_id",
//           as: "user",
//         },
//       },
//       {
//         $unwind: "$user",
//       },
//       {
//         $addFields: {
//           time: {
//             $cond: {
//               if: {
//                 $lt: [
//                   {
//                     $divide: [
//                       { $subtract: [new Date(), "$createdAt"] },
//                       1000 * 60,
//                     ],
//                   },
//                   1440,
//                 ],
//               },
//               then: {
//                 $cond: {
//                   if: {
//                     $lt: [
//                       {
//                         $divide: [
//                           { $subtract: [new Date(), "$createdAt"] },
//                           1000 * 60,
//                         ],
//                       },
//                       60,
//                     ],
//                   },
//                   then: {
//                     $concat: [
//                       {
//                         $toString: {
//                           $floor: {
//                             $divide: [
//                               { $subtract: [new Date(), "$createdAt"] },
//                               1000 * 60,
//                             ],
//                           },
//                         },
//                       },
//                       " minutes ago",
//                     ],
//                   },
//                   else: {
//                     $concat: [
//                       {
//                         $toString: {
//                           $floor: {
//                             $divide: [
//                               { $subtract: [new Date(), "$createdAt"] },
//                               1000 * 60 * 60,
//                             ],
//                           },
//                         },
//                       },
//                       " hours ago",
//                     ],
//                   },
//                 },
//               },
//               else: {
//                 $dateToString: {
//                   format: "%H:%M:%S %d-%m-%Y",
//                   date: "$createdAt",
//                   timezone: "Asia/Dhaka",
//                 },
//               },
//             },
//           },
//           isLike: { $in: [id, "$likes"] },
//           myPost: { $eq: [id, "$userId"] },
//           isFollowing: {
//             $cond: {
//               if: { $ne: [id, "$userId"] },
//               then: { $in: [id, "$user.followers"] },
//               else: "$$REMOVE",
//             },
//           },
//           isSave: { $in: [id, "$postSave",] },
//           rank: {
//             $add: [
//               { $multiply: [{ $size: "$likes" }, 1] },
//               { $multiply: [{ $size: "$comments" }, 2] },
//               { $multiply: [{ $size: "$view" }, 1] },
//               {
//                 $cond: {
//                   if: { $in: [id, "$user.followers"] },
//                   then: 10,
//                   else: 0
//                 }
//               },
//               {
//                 $cond: {
//                   if: { $in: [id, "$user.following"] },
//                   then: 15,
//                   else: 0
//                 }
//               },
//               {
//                 $cond: {
//                   if: { $in: [id, '$likes'] },
//                   then: { $add: ["$rank", -50] },
//                   else: 0
//                 }
//               },
//             ],
//           },
//         },
//       },
//       {
//         $project: {
//           _id: 1,
//           user: { _id: 1, fullName: 1, username: 1, profile: 1, verify: 1 },
//           caption: 1,
//           images: 1,
//           time: 1,
//           like: { $size: "$likes" },
//           comment: { $size: "$comments" },
//           view: { $size: "$view" },
//           isLike: 1,
//           myPost: 1,
//           postSave: { $size: "$postSave" },
//           isFollowing: 1,
//           isSave: 1,
//           rank: 1,
//         },
//       },
//       {
//         $sort: { rank: -1 },
//       },
//       {
//         $project: {
//           rank: 0,
//         },
//       },
//     ]);

//     socket.emit("posts", post)
//   } catch (error) {
//     socket.emit('error', { message: "An error occurred while fetching posts", details: error.message });
//   }
// };

// export const Like = async (socket) => {
//   try {
//     const { postId } = socket.data;  // Assuming postId is passed in socket data
//     const userId = socket.handshake.headers.id; // User ID from socket headers

//     // Check if postId is valid
//     if (!postId || !validator.isMongoId(postId)) {
//       socket.emit('error', { message: "Invalid post ID" });
//       return;
//     }

//     const post = await Post.findById(postId);
//     if (!post) {
//       socket.emit('error', { message: "Post not found." });
//       return;
//     }

//     if (post.likes.includes(userId)) {
//       await Post.findByIdAndUpdate(
//         postId,
//         { $pull: { likes: userId } },
//         { new: true }
//       );
//       socket.emit('like', { message: "Post unliked successfully." });
//     } else {
//       await Post.findByIdAndUpdate(
//         postId,
//         { $push: { likes: userId } },
//         { new: true }
//       );

//       const postUser = await User.findById(post.userId);
//       if (userId.toString() !== post.userId.toString()) {
//         await Notification.create({
//           userId: postUser._id,
//           type: "like",
//           sourceId: userId,
//           postId,
//         });
//       }

//       socket.emit('like', { message: "Post liked successfully." });
//     }
//   } catch (error) {
//     console.error("Error while liking post:", error);
//     socket.emit('error', { message: "An error occurred while processing your request." });
//   }
// };

// export const message =  async (socket) => {
//   try {
//     const 
//   } catch (error) {
    
//   }
// }

