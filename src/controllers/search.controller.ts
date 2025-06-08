import { Context } from "hono";
import { SearchService } from "../services/search.service";

export const searchContent = async (c: Context) => {
  const query = c.req.query("q");
  const type = c.req.query("type");
  const limitParam = c.req.query("limit");

  // Validasi query parameter
  if (!query) {
    return c.json({ error: "Query parameter is required" }, 400);
  }

  if (!type || !["users", "posts"].includes(type)) {
    return c.json(
      { error: 'Type parameter must be either "users" or "posts"' },
      400
    );
  }

  const limit = limitParam ? parseInt(limitParam) : undefined;

  if (limit && (isNaN(limit) || limit < 1 || limit > 50)) {
    return c.json({ error: "Limit must be a number between 1 and 50" }, 400);
  }

  try {
    let results;

    if (type === "users") {
      results = await SearchService.searchUsers(query, limit);
    } else {
      results = await SearchService.searchPosts(query, limit);
    }

    return c.json({
      query,
      type,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("Search error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};

export const getSearchSuggestions = async (c: Context) => {
  const query = c.req.query("q");
  const limitParam = c.req.query("limit");

  if (!query) {
    return c.json({ error: "Query parameter is required" }, 400);
  }

  const limit = limitParam ? parseInt(limitParam) : 5;

  if (isNaN(limit) || limit < 1 || limit > 10) {
    return c.json({ error: "Limit must be a number between 1 and 10" }, 400);
  }

  try {
    const suggestions = await SearchService.getSearchSuggestions(query, limit);

    return c.json({
      query,
      suggestions,
    });
  } catch (error) {
    console.error("Search suggestions error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
};
