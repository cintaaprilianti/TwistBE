import { Context } from "hono";
import { FollowService } from "../services/follow.service";

export const followUser = async (c: Context) => {
  const userId = c.get("user").id;
  const targetId = Number(c.req.param("userId"));
  await FollowService.follow(userId, targetId);
  return c.json({ message: "Followed successfully" });
};

export const unfollowUser = async (c: Context) => {
  const userId = c.get("user").id;
  const targetId = Number(c.req.param("userId"));
  await FollowService.unfollow(userId, targetId);
  return c.json({ message: "Unfollowed successfully" });
};

export const getFollowers = async (c: Context) => {
  const userId = Number(c.req.param("userId"));
  const followers = await FollowService.getFollowers(userId);
  return c.json(followers.map((f) => f.follower));
};

export const getFollowing = async (c: Context) => {
  const userId = Number(c.req.param("userId"));
  const following = await FollowService.getFollowing(userId);
  return c.json(following.map((f) => f.following));
};

  export const getFollowStatus = async (c: Context) => {
    const currentUserId = c.get("user").id;
    const targetId = Number(c.req.param("userId"));

    if (isNaN(targetId)) {
      return c.json({ error: "Invalid userId" }, 400);
    }

  
    const [isFollowing, targetUser] = await Promise.all([
      FollowService.checkFollowStatus(currentUserId, targetId),
      FollowService.getTargetUserProfile(targetId),
    ]);

    if (!targetUser) {
      return c.json({ error: "Target user not found" }, 404);
    }

    return c.json({ isFollowing, targetUser });
  };
