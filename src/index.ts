import { Hono } from "hono";
import auth from "./routes/auth";
import user from "../src/routes/user";
import postRoutes from "./routes/post";

const app = new Hono();

app.route("/", auth);

app.route("/user", user);

app.route("/post", postRoutes)

export default app;
