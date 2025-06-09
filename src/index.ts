import { Hono } from "hono";
import auth from "./routes/auth";
import user from "../src/routes/user";
import post from "./routes/post";
import follow from "./routes/follow";
import search from "./routes/search"

const app = new Hono();

app.route("/api/auth", auth);

app.route("/api/users", user);

app.route("/api/posts", post);

app.route("/api/users", follow)

app.route("/api/search", search)

export default app;
