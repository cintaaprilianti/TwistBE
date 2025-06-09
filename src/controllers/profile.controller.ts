// controllers/profile.controller.ts
import { Context } from "hono";
import * as ProfileService from "../services/profile.service";

export const getProfile = async (c: Context) => {
  try {
    const username = c.req.param("username");

    if (!username) {
      return c.json({ error: "Username is required" }, 400);
    }

    const profile = await ProfileService.getProfile(username);

    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    return c.json(profile);
  } catch (error: any) {
    console.error("Error getting profile:", error);
    return c.json({ error: error.message || "Failed to fetch profile" }, 500);
  }
};

export const getProfilePosts = async (c: Context) => {
  try {
    const username = c.req.param("username");
    const tab = c.req.query("tab") || "posts";
    const limit = parseInt(c.req.query("limit") || "10");
    const offset = parseInt(c.req.query("offset") || "0");

    // Validasi username
    if (!username) {
      return c.json({ error: "Username is required" }, 400);
    }

    // Validasi tab
    const validTabs = ["posts", "likes", "replies", "reposts"];
    if (!validTabs.includes(tab)) {
      return c.json(
        {
          error: "Invalid tab parameter",
          validTabs: validTabs,
        },
        400
      );
    }

    // Validasi limit
    if (isNaN(limit) || limit < 1) {
      return c.json({ error: "Limit must be a positive number" }, 400);
    }

    if (limit > 50) {
      return c.json({ error: "Limit cannot exceed 50" }, 400);
    }

    // Validasi offset
    if (isNaN(offset) || offset < 0) {
      return c.json({ error: "Offset must be a non-negative number" }, 400);
    }

    const posts = await ProfileService.getProfilePosts(username, {
      tab,
      limit,
      offset,
    });

    // Hitung total count untuk pagination yang lebih akurat
    let totalCount = posts.length;

    // Jika hasil sama dengan limit, kemungkinan ada data lebih
    // Untuk production, sebaiknya buat query terpisah untuk count total
    const hasMore = posts.length === limit;

    return c.json({
      posts,
      pagination: {
        limit,
        offset,
        count: posts.length,
        hasMore,
      },
      meta: {
        tab,
        username,
      },
    });
  } catch (error: any) {
    console.error("Error getting profile posts:", error);

    // Handle specific errors
    if (error.message === "User not found") {
      return c.json({ error: "Profile not found" }, 404);
    }

    if (error.message === "Invalid tab parameter") {
      return c.json({ error: "Invalid tab parameter" }, 400);
    }

    // Prisma specific errors
    if (error.code === "P2025") {
      return c.json({ error: "Profile not found" }, 404);
    }

    return c.json(
      {
        error: "Failed to fetch posts",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      500
    );
  }
};
