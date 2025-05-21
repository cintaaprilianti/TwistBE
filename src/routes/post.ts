
import { Hono } from "hono";
import {
  handleCreatePost,
  handleGetPosts,
} from "../controllers/post.controller";
import { authMiddleware } from "../middleware/auth";

const postRoutes = new Hono();
postRoutes.use(authMiddleware);
postRoutes.get("/", handleGetPosts);
postRoutes.post("/", handleCreatePost);

export default postRoutes;
