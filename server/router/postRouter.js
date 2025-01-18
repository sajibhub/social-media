import express from "express";
import {
  PostComment,
  PostCommentDelete,
  PostCommentUpdate,
  PostCommentView,
  PostCreate,
  PostDelete,
  PostLike,
  PostRead,
  PostSave,
  PostUpdate,
} from "../controllers/postController.js";
import Authorized from "../middleware/authorized.js";

const postRouter = express.Router();

postRouter.post("/user/post/create", Authorized, PostCreate);
postRouter.get("/user/post/read/:username", Authorized, PostRead);
postRouter.put("/user/post/update/:postId", Authorized, PostUpdate);
postRouter.delete("/user/post/delete/:postId", Authorized, PostDelete);
postRouter.put("/user/post/like/:postId", Authorized, PostLike);
postRouter.put("/user/post/comment/:postId", Authorized, PostComment);
postRouter.get("/user/post/comment/view/:postId", Authorized, PostCommentView);
postRouter.put(
  "/user/post/comment/update/:postId/:commentId",
  Authorized,
  PostCommentUpdate
);
postRouter.delete(
  "/user/post/comment/delete/:postId/:commentId",
  Authorized,
  PostCommentDelete
);
postRouter.put("/user/post/save/:postId",Authorized,PostSave)

export default postRouter;
