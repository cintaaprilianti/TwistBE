import { Hono } from "hono";
import * as AuthController from "../controllers/auth.controller";

const auth = new Hono();

auth.post("/register", AuthController.registerUser);

auth.post("/login", AuthController.loginUser);

auth.post("/forgot-password", AuthController.forgotPassword);

auth.post("/refresh", AuthController.handleRefreshToken);

auth.post("/reset-password", AuthController.resetPassword);

auth.post("/logout", AuthController.logoutUser);

export default auth;
