import { Context } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import {
  loginUserService,
  registerUserService,
  logoutUserService,
  refreshAccessTokenService,
  forgotPasswordService,
  resetPasswordService,
} from "../services/auth.service";

// Opsi cookie standar untuk keamanan (opsional, bisa diabaikan jika frontend tidak pakai cookie)
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "None" as const,
  path: "/",
};

export const registerUser = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { username, email, password, confirmPassword } = body;

    if (!username || !email || !password || !confirmPassword) {
      return c.json({ message: "Semua field wajib diisi" }, 400);
    }
    if (password !== confirmPassword) {
      return c.json({ message: "Password dan konfirmasi tidak cocok" }, 400);
    }

    const { user, token, refreshToken, refreshTokenExpiresIn } = await registerUserService({
      username,
      email,
      password,
      confirmPassword,
    });

    if (refreshToken && refreshTokenExpiresIn) {
      setCookie(c, "refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: refreshTokenExpiresIn,
      });
    }

    return c.json({
      user: { id: user.id, username: user.username, email: user.email, createdAt: new Date().toISOString() },
      token,
      message: "Registrasi berhasil!",
      resetToken: null,
      resetLink: null,
    });
  } catch (err: any) {
    return c.json({ message: err.message || "Registrasi gagal" }, 400);
  }
};

export const loginUser = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;

    if (!username || !password) {
      return c.json({ message: "Username atau password wajib diisi" }, 400);
    }

    const { user, token, refreshToken, refreshTokenExpiresIn } = await loginUserService({
      username,
      password,
    });

    if (refreshToken && refreshTokenExpiresIn) {
      setCookie(c, "refreshToken", refreshToken, {
        ...cookieOptions,
        maxAge: refreshTokenExpiresIn,
      });
    }

    return c.json({
      user: { id: user.id, username: user.username, email: user.email, createdAt: new Date().toISOString() },
      token,
      message: "Login berhasil!",
      resetToken: null,
      resetLink: null,
    });
  } catch (err: any) {
    return c.json({ message: err.message || "Login gagal" }, 400);
  }
};

export const logoutUser = async (c: Context) => {
  try {
    const refreshToken = getCookie(c, "refreshToken");
    if (refreshToken) {
      await logoutUserService(refreshToken);
    }
    deleteCookie(c, "refreshToken", cookieOptions);
    return c.json({ message: "Logout berhasil" });
  } catch (err: any) {
    console.error("LOGOUT_ERROR:", err);
    return c.json({ message: "Gagal logout", details: err.message }, 500);
  }
};

export const handleRefreshToken = async (c: Context) => {
  try {
    const refreshToken = getCookie(c, "refreshToken");
    if (!refreshToken) {
      return c.json({ message: "Sesi tidak ditemukan, silakan login." }, 401);
    }

    const { token } = await refreshAccessTokenService(refreshToken);
    return c.json({ token });
  } catch (error: any) {
    return c.json({ message: "Sesi tidak valid, silakan login kembali." }, 403);
  }
};

export const forgotPassword = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { email } = body;

    if (!email) {
      return c.json({ message: "Email wajib diisi" }, 400);
    }

    const result = await forgotPasswordService({ email });
    return c.json({
      message: result.message,
      resetToken: result.resetToken,
      resetLink: result.resetLink,
    });
  } catch (err: any) {
    return c.json({ message: err.message || "Gagal mengirim link reset" }, 400);
  }
};

export const resetPassword = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { token, password, confirmPassword } = body;

    if (!token || !password || !confirmPassword) {
      return c.json({ message: "Token, password, dan konfirmasi password wajib diisi" }, 400);
    }
    if (password !== confirmPassword) {
      return c.json({ message: "Password dan konfirmasi tidak cocok" }, 400);
    }

    const result = await resetPasswordService({ token, password, confirmPassword });
    return c.json({
      message: result.message,
    });
  } catch (err: any) {
    return c.json({ message: err.message || "Gagal mereset password" }, 400);
  }
};