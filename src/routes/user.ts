import { Hono } from "hono";
import { deleteUserAccount, getAllUsers, updateUserProfile } from "../controllers/user.controller";
import { authMiddleware } from "../middleware/auth";

const user = new Hono();

user.use("/user", authMiddleware);

user.get("/", getAllUsers);

user.patch("/update", updateUserProfile)
user.delete("/delete", deleteUserAccount);

export default user;
