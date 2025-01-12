import express from "express";
import {
  PostComment,
  PostCommentDelete,
  PostCreate,
  PostDelete,
  PostLike,
  PostRead,
  PostUpdate,
} from "../controllers/postController.js";
import Authorized from "../middleware/authorized.js";

const postRouter = express.Router();

postRouter.post("/user/post/create", Authorized, PostCreate);
postRouter.get("/user/post/read", Authorized, PostRead);
postRouter.put("/user/post/update/:id", Authorized, PostUpdate);
postRouter.delete("/user/post/delete/:id", Authorized, PostDelete);
postRouter.put("/user/post/like/:id", Authorized, PostLike);
postRouter.put("/user/post/comment/:id", Authorized, PostComment);
postRouter.delete(
  "/user/post/comment/delete/:id/:commentId",
  Authorized,
  PostCommentDelete
);

export default postRouter;
