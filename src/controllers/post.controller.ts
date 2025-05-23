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

export const handleGetPostDetail = async (c: Context) => {
  const postId = Number(c.req.param("postId"));
  const post = await PostService.getPostDetail(postId);
  if (!post) return c.json({ error: "Post not found" }, 404);
  return c.json(post);
};

export const handleUpdatePost = async (c: Context) => {
  const userId = c.get("user").id;
  const postId = Number(c.req.param("postId"));
  const body = await c.req.json();

  if (!body.content || typeof body.content !== "string") {
    return c.json({ error: "Content is required" }, 400);
  }

  const updatedPost = await PostService.updatePost(
    userId,
    postId,
    body.content
  );
  if (!updatedPost) {
    return c.json({ error: "Post not found or unauthorized" }, 404);
  }

  return c.json(updatedPost);
};

export const handleDeletePost = async (c: Context) => {
  const userId = c.get("user").id;
  const postId = Number(c.req.param("postId"));

  const deleted = await PostService.deletePost(userId, postId);
  if (!deleted) {
    return c.json({ error: "Post not found or unauthorized" }, 404);
  }

  return c.json({ message: "Post deleted successfully" });
};

export const handleLikePost = async (c: Context) => {
  const userId = c.get("user").id;
  const postId = Number(c.req.param("postId"));
  const liked = await PostService.toggleLikePost(userId, postId);
  return c.json({ message: liked ? "Post liked" : "Like removed" });
};

export const handleRepost = async (c: Context) => {
  const userId = c.get("user").id;
  const postId = Number(c.req.param("postId"));
  const reposted = await PostService.toggleRepost(userId, postId);
  return c.json({ message: reposted ? "Reposted" : "Repost removed" });
};

export const handleQuotePost = async (c: Context) => {
  const userId = c.get("user").id;
  const postId = Number(c.req.param("postId"));
  const body = await c.req.json();
  const quote = await PostService.quotePost(userId, postId, body.quoteContent);
  return c.json(quote);
};

export const handleGetPostComments = async (c: Context) => {
  const postId = Number(c.req.param("postId"));
  const comments = await PostService.getPostComments(postId);
  return c.json(comments);
};

export const handleAddComment = async (c: Context) => {
  const userId = c.get("user").id;
  const postId = Number(c.req.param("postId"));
  const body = await c.req.json();
  if (!body.content || typeof body.content !== "string") {
    return c.json({ error: "Content is required" }, 400);
  }
  const comment = await PostService.addComment(userId, postId, body.content);
  return c.json(comment, 201);
};
