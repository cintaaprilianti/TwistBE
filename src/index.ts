import { Hono } from "hono";
import auth from "./routes/auth";
import user from "../src/routes/user";
import post from "./routes/post";
import follow from "./routes/follow";

const app = new Hono();

app.route("/api/auth", auth);

app.route("/api/users", user);

app.route("/api/posts", post);

app.route("/api/users", follow)

export default app;
