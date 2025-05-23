
import { Hono } from "hono";
import {
  handleCreatePost,
  handleGetPosts,
  handleUpdatePost,
  handleDeletePost,
  handleGetPostDetail,
  handleGetPostComments,
  handleAddComment,
  handleLikePost,
  handleRepost,
  handleQuotePost
} from "../controllers/post.controller";
import { authMiddleware } from "../middleware/auth";

const postRoutes = new Hono();
postRoutes.use(authMiddleware);
postRoutes.get("/", handleGetPosts);
postRoutes.post("/", handleCreatePost);
postRoutes.put("/:postId", handleUpdatePost);
postRoutes.delete("/:postId", handleDeletePost);
postRoutes.get("/:postId", handleGetPostDetail);
postRoutes.get("/:postId/comments", handleGetPostComments);
postRoutes.post("/:postId/comments", handleAddComment);
postRoutes.post("/:postId/like", handleLikePost);
postRoutes.post("/:postId/repost", handleRepost);
postRoutes.post("/:postId/quote", handleQuotePost);


export default postRoutes;
