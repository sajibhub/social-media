import express from "express";

import {
  Login,
  Logout,
  SignUp,
  Profile,
  ForgetOTP,
  PasswordReset,
  Follow,
  ProfilePicUpdate,
  ProfileInfoUpdate,
  GetFollowers,
  GetFollowing,
  GetSavePost,
  SearchUser,
  GetImages,
  googleRouter,
  googleRouterCallback,
} from "../controllers/userController.js";
import Authorized from "../middleware/authorized.js";

const userRouter = express.Router();

userRouter.post("/user/auth/signup", SignUp);
userRouter.get('/user/auth/google', googleRouter);
userRouter.get('/user/auth/google/callback', googleRouterCallback);
userRouter.post("/user/auth/login", Login);
userRouter.post("/user/auth/logout", Authorized, Logout);
userRouter.get("/user/profile/:username", Authorized, Profile);
userRouter.put("/user/profile/pic/update", Authorized, ProfilePicUpdate);
userRouter.put("/user/profile/info/update", Authorized, ProfileInfoUpdate);
userRouter.post("/user/auth/forger/password/:email", ForgetOTP);
userRouter.put("/user/auth/forger/password", PasswordReset);
userRouter.put("/user/profile/follow/:userId", Authorized, Follow);
userRouter.get("/user/followers/:username", Authorized, GetFollowers);
userRouter.get("/user/following/:username", Authorized, GetFollowing);
userRouter.get("/user/save/post", Authorized, GetSavePost)
userRouter.post("/user/search", Authorized, SearchUser)
userRouter.get("/user/profile/post/images/:username", Authorized, GetImages)

export default userRouter;
