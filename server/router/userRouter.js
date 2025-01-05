import express from "express";

import {
  Login,
  Logout,
  SignUp,
  Profile,
  ForgetOTP,
  PasswordReset,
  profileUpdate,
} from "../controllers/userController.js";
import Authorized from "../middleware/authorized.js";

const userRouter = express.Router();

userRouter.post("/user/auth/signup", SignUp);
userRouter.post("/user/auth/login", Login);
userRouter.post("/user/auth/logout", Authorized, Logout);
userRouter.get("/user/profile", Authorized, Profile);
userRouter.post("/user/auth/forger/password/:email", ForgetOTP);
userRouter.put("/user/auth/forger/password", PasswordReset);
userRouter.put("/user/profile/profile", Authorized, profileUpdate);

export default userRouter;
