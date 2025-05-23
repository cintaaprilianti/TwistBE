import { Hono } from "hono";
import * as FollowController from "../controllers/follow.controller";
import { authMiddleware } from "../middleware/auth";

const follow = new Hono();

follow.use("*", authMiddleware); // semua butuh auth

follow.get("/:userId/followers", FollowController.getFollowers);
follow.get("/:userId/following", FollowController.getFollowing);
follow.get("/:userId/follow-status", FollowController.getFollowStatus);

follow.post("/:userId/follow", FollowController.followUser);
follow.delete("/:userId/follow", FollowController.unfollowUser);

export default follow;
