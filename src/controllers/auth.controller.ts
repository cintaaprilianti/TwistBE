import { Context } from "hono";
import { 
  loginUserService, 
  registerUserService, 
  forgotPasswordService,  
  resetPasswordService} from "../services/auth.service";

export const registerUser = async (c: Context) => {
  try {
    const body = await c.req.json();
    const result = await registerUserService(body);
    return c.json(result);
  } catch (err) {
    console.error(err);

    if (err instanceof Error) {
      return c.json({ error: err.message }, 400); // error dari input user
    }

    return c.json({ error: "Terjadi kesalahan saat registrasi" }, 500);
  }
};


export const loginUser = async (c: Context) => {
  try {
    const body = await c.req.json();
    const result = await loginUserService(body);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message || "Login gagal" }, 400);
  }
};

export const forgotPassword = async (c: Context) => {
  try {
    const body = await c.req.json();
    const result = await forgotPasswordService(body);
    return c.json(result);
  } catch (err: any) {
    return c.json(
      { error: err.message || "Gagal mengirim reset password" },
      400
    );
  }
};

export const resetPassword = async (c: Context) => {
  try {
    const body = await c.req.json();
    const result = await resetPasswordService(body);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal reset password" }, 400);
  }
};


