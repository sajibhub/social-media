import validator from "validator";
import bcrypt from "bcrypt";
import random from "r-password";
import mongoose from "mongoose";
import multer from "multer";

import User from "../models/userModel.js";
import { Mail } from "../utils/mail.js";
import TokenAndCookie from "../utils/TokenAndCookie.js";
import {
  NewAccount,
  OtpMail,
  PasswordResetSuccess,
} from "../utils/mailTemplate.js";
import storage from "../utils/cloudinary.js";
import Notification from "../models/notificationModel.js";
import Post from "../models/postModel.js";
import { io } from "../app.js";
import postTime from "../utils/postTime.js";

const phoneRegex = /^(?:\+88|0088)?(01[3-9]\d{8})$/;
const usernameRegex = /^[a-zA-Z0-9]+$/;
const FullNameRegex = /^[a-zA-Z\s]+$/;



export const SignUp = async (req, res) => {
  try {
    const { username, fullName, email, phone, password } = req.body;

    if (!fullName || !password || !email || !username) {
      return res.status(400).json({
        message: "All fields must be provided",
      });
    }

    if (fullName === "" || password === "" || email === "" || username === "") {
      return res.status(400).json({
        message: "Fields cannot be empty",
      });
    }

    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message: "Username must be alphanumeric."
      });
    }
    if (!FullNameRegex.test(fullName)) {
      return res.status(400).json({
        message: "Full name can only include letters and spaces."
      });
    }

    if (username == "me") {
      return res.status(400).json({
        message: "Username can't be 'me'. Please select another."
      });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Invalid email. Please check the format."
      });
    }

    if (phone) {
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          message: "Invalid phone number. Please use a valid Bangladeshi number."
        });
      }
    }

    if (username.length > 30) {
      return res.status(422).json({
        message: "Username cannot be longer than 30 characters."
      });
    }


    if (fullName.length > 40) {
      return res.status(422).json({
        message: "Full name cannot be longer than 40 characters."
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long."
      });
    }

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        message: "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character."
      });
    }

    const userNameExists = await User.findOne({ username });

    if (userNameExists) {
      return res.status(400).json({
        message: "Username already taken. Please choose another."
      });
    }

    const userExists = await User.findOne({
      $or: [{ email: email }, { phone: phone }],
    });

    if (userExists) {
      if (userExists.email === email) {
        return res.status(400).json({
          message: "An account with this email already exists."
        });
      }

      if (userExists.phone === phone) {
        return res.status(400).json({
          message: "An account with this phone number already exists."
        });
      }
    }



    const demoProfile = `https://avatar.iran.liara.run/username?username=${fullName.replaceAll(
      " ",
      "+"
    )}`;

    const userCreate = await User.create({
      username,
      fullName,
      email,
      phone,
      password: await bcrypt.hash(password, 10),
      profile: demoProfile,
      cover: demoProfile,
      provider: "email",
      visitorId: "",
    });

    if (!userCreate) {
      return res.status(400).json({
        message: "Account creation failed. Please try again."
      });
    }

    const date = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h12",
    })
      .format(new Date(userCreate.createdAt))
      .replace(",", "")
      .replaceAll("/", "-");
    Mail(email, "New Account Create", NewAccount(fullName, email, phone, date));
    return res.status(201).json({
      message: "Congratulations! Your account has been created successfully!"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const Login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(403).json({
        message: "All fields are required",
      });
    }

    if (username == "" || password == "") {
      return res.status(400).json({
        message: "Fields cannot be empty",
      });
    }

    const findUser = await User.findOne({
      $or: [{ username }, { email: username }, { phone: username }],
    });

    if (!findUser) {
      return res.status(404).json({
        message: "Account not found. Check credentials or register",
      });
    }

    const MatchPassword = await bcrypt.compare(password, findUser.password);
    if (!MatchPassword) {
      return res.status(400).json({
        message: "Incorrect password. Please try again.",
      });
    }

    await TokenAndCookie(findUser._id, res);

    await User.findByIdAndUpdate(
      findUser._id,
      { lastLogin: new Date(), provider: "email" },
      { new: true }
    );
    return res.status(200).json({
      message: "Login successful",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const Logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: "none",
      secure: true,
      path: "/",
    });
    return res.status(200).json({
      message: "Logout Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};


export const Profile = async (req, res) => {
  try {
    const { id } = req.headers;
    const { username } = req.params;
    const objectId = new mongoose.Types.ObjectId(id);

    // Determine which user to fetch
    const matchCondition =
      username === "me" ? { _id: objectId } : { username };

    const profile = await User.aggregate([
      { $match: matchCondition },

      // Lookup liked posts
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "likes",
          as: "likedPosts",
        },
      },

      // Lookup notifications
      {
        $lookup: {
          from: "notifications",
          localField: "_id",
          foreignField: "userId",
          as: "notifications",
        },
      },

      // Compute sizes and flags
      {
        $addFields: {
          followers: { $size: { $ifNull: ["$followers", []] } },
          following: { $size: { $ifNull: ["$following", []] } },
          postLike: { $size: { $ifNull: ["$likedPosts", []] } },
          postSave: { $size: { $ifNull: ["$postSave", []] } },
          myProfile: { $eq: ["$_id", objectId] },
          isFollowing: {
            $cond: [
              { $ne: ["$_id", objectId] },
              { $in: [objectId, { $ifNull: ["$followers", []] }] },
              "$$REMOVE",
            ],
          },
          notification: {
            $size: {
              $filter: {
                input: { $ifNull: ["$notifications", []] },
                as: "notification",
                cond: { $eq: ["$$notification.isRead", false] },
              },
            },
          },
        },
      },

      // Project only the fields we want
      {
        $project: {
          username: 1,
          fullName: 1,
          email: { $cond: [{ $eq: ["$_id", objectId] }, "$email", "$$REMOVE"] },
          phone: { $cond: [{ $eq: ["$_id", objectId] }, "$phone", "$$REMOVE"] },
          profile: 1,
          cover: 1,
          provider: { $cond: [{ $eq: ["$_id", objectId] }, "$provider", "$$REMOVE"] },
          facebookId: { $cond: [{ $eq: ["$_id", objectId] }, "$facebookId", "$$REMOVE"] },
          googleId: { $cond: [{ $eq: ["$_id", objectId] }, "$googleId", "$$REMOVE"] },
          githubId: { $cond: [{ $eq: ["$_id", objectId] }, "$githubId", "$$REMOVE"] },
          bio: 1,
          verify: 1,
          location: 1,
          profession: 1,
          mediaLink: 1,
          followers: 1,
          following: 1,
          postLike: 1,
          postSave: 1,
          myProfile: 1,
          isFollowing: 1,
          notification: 1,
          lastActive: 1,
        },
      },
    ]);

    if (!profile.length)
      return res.status(404).json({ message: "Profile not found" });

    return res.status(200).json({ profile: profile[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const ProfilePicUpdate = async (req, res) => {
  try {
    const upload = multer({ storage }).fields([
      { name: "profile", maxCount: 1 },
      { name: "cover", maxCount: 1 },
    ]);

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          message: err.message,
        });
      }

      const files = req.files || {};
      const profile = files.profile;
      const cover = files.cover;

      if (!profile && !cover) {
        return res.status(400).json({
          message: "Please provide at least one image.",
        });
      }

      const updateData = {};

      if (profile) {
        updateData.profile = profile[0].path;
      }

      if (cover) {
        updateData.cover = cover[0].path;
      }

      const profileImgUpdate = await User.findByIdAndUpdate(
        req.headers.id,
        updateData,
        {
          new: true,
        }
      );
      return res.status(200).json({
        message: "Profile pic updated successfully.",
      });
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const ProfileInfoUpdate = async (req, res) => {
  try {
    const {
      fullName,
      username,
      bio,
      location,
      oldPassword,
      newPassword,
      profession,
      facebook,
      linkedin,
      fiver,
      github,
    } = req.body;

    if (
      !fullName &&
      !username &&
      !bio &&
      !facebook &&
      !linkedin &&
      !fiver &&
      !github &&
      location &&
      profession &&
      !newPassword &&
      !oldPassword
    ) {
      return res.status(400).json({
        message: "Please fill in at least one field.",
      });
    }

    const user = await User.findById(req.headers.id);

    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        message: "Username must be alphanumeric."
      });
    }
    if (!FullNameRegex.test(fullName)) {
      return res.status(400).json({
        message: "Full name can only include letters and spaces."
      });
    }
    if (username) {
      const usernameFind = await User.findOne({ username: { $ne: user.username } }).select({
        _id: 0,
        username: 1,
      });

      if (usernameFind) {
        return res.status(400).json({
          message: "Username is already taken.",
        });
      }
    }

    if (oldPassword || newPassword) {
      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          message: "Both old and new passwords are required."
        });
      }

      if (!(await bcrypt.compare(oldPassword, user.password))) {
        return res.status(400).json({
          message: "Incorrect old password. Please try again.",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message: "Password should be at least 6 characters long.",
        });
      }

      if (username.length > 30) {
        return res.status(422).json({
          message: "Username cannot be longer than 30 characters."
        });
      }

      if (fullName.length > 40) {
        return res.status(422).json({
          message: "Full name cannot be longer than 40 characters."
        });
      }

      if (!validator.isStrongPassword(password)) {
        return res.status(400).json({
          message: "Password must have an uppercase letter, lowercase letter, number, and special character."
        });
      }

      if (await bcrypt.compare(newPassword, user.password)) {
        return res.status(400).json({
          message: "New password can't be the same as the old one."
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    const profileUpdate = await User.findByIdAndUpdate(
      req.headers.id,
      {
        fullName,
        username,
        bio,
        location,
        password: user.password,
        mediaLink: {
          ...user.mediaLink,
          ...(fiver ? { fiver } : {}),
          ...(github ? { github } : {}),
          ...(facebook ? { facebook } : {}),
          ...(linkedin ? { linkedin } : {}),
        },
        profession,
      },
      { new: true }
    );
    return res.status(200).json({
      message: "Profile info updated successfully!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const ForgetOTP = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) {
      return res.status(404).json({
        message: "Please Provide Email Address",
      });
    }

    const find = await User.findOne({ email: email });
    if (!find) {
      return res.status(404).json({
        message:
          "We couldn't find an account associated with this email address. Please check and try again!",
      });
    }

    if (find.otp.expired - 180000 > new Date().getTime()) {
      const minuteCat = find.otp.expired - 180000;
      const time = minuteCat - new Date().getTime();
      const showTime = time / 1000;
      return res.status(400).json({
        message: `OTP  has already send to you email. please try again ${showTime.toFixed(
          0
        )} seconds later`,
      });
    }
    const OTP = await random(6, true, false, false, false);

    await Mail(email, "MATRIX OTP", OtpMail(OTP));
    const update = await User.findByIdAndUpdate(find._id, {
      $set: {
        "otp.code": OTP,
        "otp.expired": new Date().getTime() + 5 * 60 * 1000,
      },
    });

    if (!update) {
      return res.status(404).json({
        message: "Sorry, Something Wrong",
      });
    }

    return res.status(200).json({
      message: "Mail sent successfully Please check your mail box",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const PasswordReset = async (req, res) => {
  try {
    const { email, code, password } = req.body;
    if (
      !email ||
      !code ||
      !password ||
      email == "" ||
      code == "" ||
      password == ""
    ) {
      return res.status(404).json({
        message: "All fields are required and cannot be empty",
      });
    }
    if (!validator.isEmail(email)) {
      return res.status(404).json({
        message: "Invalid email address",
      });
    }

    const checkEmailInfo = await User.findOne({ email });

    if (!checkEmailInfo) {
      return res.status(404).json({
        message: "No account found with this email address.",
      });
    }

    if (checkEmailInfo.otp.code != code) {
      return res.status(400).json({
        message: "This OTP Wrong. Please Provide Correct OTP",
      });
    }

    if (checkEmailInfo.otp.expired < new Date().getTime()) {
      return res.status(400).json({
        message: "The OTP has expired. Please request a new one.",
      });
    }

    const passwordCheck = await bcrypt.compare(
      password,
      checkEmailInfo.password
    );

    if (passwordCheck) {
      return res.status(400).json({
        message: "New password must be different from the current one.",
      });
    }

    if (password <= 6) {
      return res.status(400).json({
        message:
          "our password must be at least 6 characters long. Please try again!",
      });
    }

    const Update = await User.findByIdAndUpdate(
      checkEmailInfo._id,
      {
        password: await bcrypt.hash(password, 10),
        expired: new Date().getTime(),
      },
      { new: true }
    );

    if (!Update) {
      return res.status(400).json({
        message: "Password Update Field",
      });
    }

    Mail(
      email,
      "Password Reset",
      "",
      PasswordResetSuccess(checkEmailInfo?.fullName)
    );
    return res.status(200).json({
      message: "Password Reset successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const Follow = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.userId)) {
      return res.status(400).json({
        message: "Invalid userId",
      });
    }

    const userId = new mongoose.Types.ObjectId(req.params.userId);
    const { id } = req.headers;

    if (id.toString() === userId.toString()) {
      return res.status(400).json({
        message: "You can't follow yourself",
      });
    }

    const findUser = await User.findById(userId).select({ followers: 1 });
    if (!findUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const alreadyFollowing = findUser.followers.includes(id);

    if (alreadyFollowing) {
      await User.findByIdAndUpdate(
        userId,
        {
          $pull: { followers: id },
        },
        { new: true }
      );
      await User.findByIdAndUpdate(id, {
        $pull: { following: userId },
      },
        {
          new: true
        })
      return res.status(200).json({
        message: "Unfollowed successfully",
      });
    } else {
      await User.findByIdAndUpdate(
        userId,
        {
          $push: { followers: id },
        },
        { new: true }
      );
      await User.findByIdAndUpdate(
        id,
        {
          $push: { following: userId },
        },
        { new: true }
      );
      const notification = await Notification.create({
        userId,
        type: "follow",
        sourceId: id,
        postId: null
      })
      const user = await User.findOne({ _id: id }).select({ fullName: 1, username: 1, profile: 1, verify: 1 })
      const data = {
        _id: notification._id,
        userId: userId._id,
        sourceId: id,
        postId: null,
        time: postTime(notification.createdAt),
        type: "follow",
        isRead: false,
        user
      }
      io.to(userId._id.toString()).emit('notification', data)
      return res.status(200).json({
        message: "Followed successfully",
      });
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
};

export const GetFollowers = async (req, res) => {
  try {
    const { id } = req.headers
    const { username } = req.params;

    const userFind = await User.findOne({ username }).select({ _id: 1 })
    const followers = await User.aggregate([
      { $match: { _id: userFind._id } },
      {
        $lookup: {
          from: "users",
          localField: "followers",
          foreignField: "_id",
          as: "users",
        }
      },
      { $unwind: "$users" },
      {
        $addFields: {
          isFollowing: { $in: [id, "$users.followers"] }
        }
      },
      {
        $project: {
          _id: "$users._id",
          fullName: "$users.fullName",
          username: "$users.username",
          profile: "$users.profile",
          isFollowing: 1,
          verify: "$users.verify",
        }
      }
    ])
    return res.status(200).json({
      followers
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
}

export const GetFollowing = async (req, res) => {
  try {
    const { id } = req.headers;
    const { username } = req.params;

    const userFind = await User.findOne({ username }).select({ _id: 1 })
    const following = await User.aggregate([
      { $match: { _id: userFind._id } },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "users",
        }
      },
      { $unwind: "$users" },
      {
        $addFields: {
          isFollowing: {
            $in: [id, "$users.followers"],
          },
        },
      },
      {
        $project: {
          _id: "$users._id",
          fullName: "$users.fullName",
          username: "$users.username",
          profile: "$users.profile",
          isFollowing: 1,
          verify: "$users.verify",
        }
      }
    ])
    return res.status(200).json({
      following
    })
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
}

export const GetSavePost = async (req, res) => {
  try {
    const { id } = req.headers
    const savedPosts = await User.aggregate([
      { $match: { _id: id } },
      {
        $lookup: {
          from: "posts",
          localField: "postSave",
          foreignField: "_id",
          as: "savedPosts",
        },
      },
      { $unwind: "$savedPosts" },
      {
        $lookup: {
          from: "users",
          localField: "savedPosts.userId",
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
                      { $subtract: [new Date(), "$savedPosts.createdAt"] },
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
                          { $subtract: [new Date(), "$savedPosts.createdAt"] },
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
                              { $subtract: [new Date(), "$savedPosts.createdAt"] },
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
                              { $subtract: [new Date(), "$savedPosts.createdAt"] },
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
                  date: "$savedPosts.createdAt",
                  timezone: "Asia/Dhaka",
                },
              },
            },
          },
          isLike: { $in: [id, "$savedPosts.likes"] },
          myPost: { $eq: [id, "$savedPosts.userId"] },
          isFollowing: {
            $cond: {
              if: { $ne: [id, "$savedPosts.userId"] },
              then: { $in: [id, "$user.followers"] },
              else: "$$REMOVE",
            },
          },
          isSave: { $in: [id, "$savedPosts.postSave",] },
        }
      },
      { $sort: { "postSave": 1 } },
      {
        $project: {
          _id: "$savedPosts._id",
          user: { _id: 1, fullName: 1, username: 1, profile: 1, verify: 1 },
          caption: "$savedPosts.caption",
          images: "$savedPosts.images",
          time: 1,
          likes: { $size: "$savedPosts.likes" },
          comment: { $size: "$savedPosts.comments" },
          view: { $size: "$savedPosts.view" },
          postSave: { $size: "$savedPosts.postSave" },
          isLike: 1,
          myPost: 1,
          isFollowing: 1,
          isSave: 1,
        }
      },
    ]);


    return res.status(200).json({
      savedPosts
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });
  }
}

export const GetImages = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) {
      return res.status(400).json({
        message: "Username is required."
      })
    }
    const userFind = await User.findOne({ username }).select({ _id: 1 })
    const images = await Post.aggregate([
      { $match: { userId: userFind._id } },
      { $unwind: "$images" },
      {
        $project: {
          _id: 0,
          images: 1
        }
      }
    ])

    const flatImages = images
      .flatMap(item => item.images || [])
      .filter(url => url !== null);

    return res.status(200).json({
      images: flatImages
    })
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request.",
    });

  }
}

export const SearchUser = async (req, res) => {
  try {

    const { id } = req.headers
    const { search } = req.body

    if (!search) {
      return res.status(400).json({
        message: "Search query is required."
      })
    }

    if (!search.trim() && /[a-zA-Z0-9]/.test(!search)) {
      return res.status(400).json({
        message: "Search query must contain only letters and numbers."
      })
    }

    const searchUser = await User.aggregate([
      {
        $match: {
          _id: { $ne: id },
          $or: [
            { username: { $regex: search, $options: "i" } },
            { fullName: { $regex: search, $options: "i" } }
          ]
        }
      },

      {
        $addFields: {
          isFollowing: { $in: [id, "$following"] }
        }
      },
      {
        $addFields: {
          bio: {
            $let: {
              vars: {
                first10Words: {
                  $reduce: {
                    input: { $slice: [{ $split: ["$bio", " "] }, 10] },
                    initialValue: "",
                    in: {
                      $cond: {
                        if: { $eq: ["$$value", ""] },
                        then: "$$this",
                        else: { $concat: ["$$value", " ", "$$this"] }
                      }
                    }
                  }
                },
                totalWords: { $size: { $split: ["$bio", " "] } }
              },
              in: {
                $cond: {
                  if: { $gt: ["$$totalWords", 10] },
                  then: { $concat: ["$$first10Words", " ..."] },
                  else: "$$first10Words"
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          username: 1,
          profile: 1,
          isFollowing: 1,
          followers: { $size: "$followers" },
          bio: 1,
          verify: 1
        }
      }
    ]);
    return res.status(200).json({
      searchUser
    })
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while processing your request."
    })
  }
}