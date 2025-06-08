import { Hono } from "hono";
import {
  searchContent,
  getSearchSuggestions,
} from "../controllers/search.controller";
import { authMiddleware } from "../middleware/auth";

const searchRouter = new Hono();

searchRouter.use("*", authMiddleware);

// GET /api/search?q={query}&type={users|posts}&limit={number}
searchRouter.get("/", searchContent);

// GET /api/search/suggestions?q={query}&limit={number}
searchRouter.get("/suggestions", getSearchSuggestions);

export default searchRouter;
