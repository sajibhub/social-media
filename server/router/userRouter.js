import express from "express";

import {
  Login,
  Logout,
  SignUp,
  Profile,
  ForgetOTP,
  PasswordReset,
  Follow,
  ProfileUpdate,
} from "../controllers/userController.js";
import Authorized from "../middleware/authorized.js";

const userRouter = express.Router();

userRouter.post("/user/auth/signup", SignUp);
userRouter.post("/user/auth/login", Login);
userRouter.post("/user/auth/logout", Authorized, Logout);
userRouter.get("/user/profile/:username", Authorized, Profile);
userRouter.put("/user/profile/update", Authorized, ProfileUpdate);
userRouter.post("/user/auth/forger/password/:email", ForgetOTP);
userRouter.put("/user/auth/forger/password", PasswordReset);
userRouter.put("/user/profile/follow/:userId", Authorized, Follow);

export default userRouter;
