import express from "express";
import {
  PostCreate,
  PostDelete,
  PostRead,
  PostUpdate,
} from "../controllers/postController.js";
import Authorized from "../middleware/authorized.js";

const postRouter = express.Router();

postRouter.post("/user/post/create", Authorized, PostCreate);
postRouter.get("/user/post/read", Authorized, PostRead);
postRouter.put("/user/post/update/:id", Authorized, PostUpdate);
postRouter.delete("/user/post/delete/:id", Authorized, PostDelete);

export default postRouter;
