import { MiddlewareHandler } from "hono";
import jwt from "jsonwebtoken"; 

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader) {
    return c.json({ error: "Token tidak ditemukan" }, 401);
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return c.json({ error: "Token tidak valid" }, 401);
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
    };
    c.set("userId", payload.id);
    await next();
  } catch (err) {
    return c.json({ error: "Token tidak valid atau kadaluarsa" }, 401);
  }
};


