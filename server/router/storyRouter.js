import express from "express";
import Authorized from "../middleware/authorized.js";
import { storyCreate, storyDeleted, storyLike, storyRead, storyViewed } from "../controllers/storyController.js";

const Story = express.Router()

Story.post("/user/story/create", Authorized, storyCreate)
Story.get("/user/story/read", Authorized, storyRead)
Story.delete("/user/story/delete/:storyId", Authorized, storyDeleted)
Story.put("/user/story/viewed/:storyId", Authorized, storyViewed)
Story.put("/user/story/like/:storyId", Authorized, storyLike)

export default Story