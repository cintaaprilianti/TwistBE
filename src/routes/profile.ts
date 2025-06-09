import { Hono } from "hono";
import * as ProfileController from "../controllers/profile.controller";

const profileRoutes = new Hono();

// GET /api/profile/:username - Get user profile
profileRoutes.get("/:username", ProfileController.getProfile);

// GET /api/profile/:username/posts - Get user posts with tabs
profileRoutes.get("/:username/posts", ProfileController.getProfilePosts);

export default profileRoutes;
