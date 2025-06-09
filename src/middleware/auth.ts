import { Context, Next } from "hono";
import { verifyJwt } from "../utils/jwt"; 
interface TokenPayload {
  id: number;
  username: string;
  type: string; 
  iat: number;
  exp: number;
}

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json(
        { error: "Unauthorized: Token tidak valid atau tidak diberikan." },
        401
      );
    }

    const token = authHeader.split(" ")[1];

    const decodedPayload = verifyJwt(token) as TokenPayload;

    if (decodedPayload.type !== "login") {
      return c.json({ error: "Unauthorized: Tipe token tidak valid." }, 401);
    }

    c.set("user", {
      id: decodedPayload.id,
      username: decodedPayload.username,
    });

    await next();
  } catch (error: any) {
    
    return c.json(
      {
        error: "Unauthorized: Token tidak valid atau kedaluwarsa.",
        details: error.name, 
      },
      401
    );
  }
};
