import { Hono } from "hono";
import * as AuthController from "../controllers/auth.controller";

const auth = new Hono();

auth.post("/register", AuthController.registerUser);

auth.post("/login", AuthController.loginUser);



export default auth;
