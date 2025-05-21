import { Context } from "hono";
import * as PostService from "../services/post.service";

export const handleCreatePost = async (c: Context) => {
  const userId = c.get("user").id;
  const body = await c.req.json();
  if (!body.content || typeof body.content !== "string") {
    return c.json({ error: "Content is required" }, 400);
  }
  
  const post = await PostService.createPost(userId, body);
  return c.json(post, 201);
};

export const handleGetPosts = async (c: Context) => {
  const posts = await PostService.getPosts();
  return c.json(posts);
};
