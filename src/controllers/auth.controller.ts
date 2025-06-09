import { Context } from "hono";
// 1. Impor 'getCookie' bersama dengan helper lainnya
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import {
  loginUserService,
  registerUserService,
  logoutUserService,
  refreshAccessTokenService,
  forgotPasswordService,
  resetPasswordService,
} from "../services/auth.service";

// Opsi cookie standar untuk keamanan. Didefinisikan sekali untuk konsistensi.
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Hanya 'true' saat di production (HTTPS)
  sameSite: "None" as const, // Wajib 'None' jika frontend & backend beda domain
  path: "/",
};


export const registerUser = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { user, accessToken, refreshToken, refreshTokenExpiresIn } =
      await registerUserService(body);

    setCookie(c, "refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenExpiresIn,
    });

    return c.json({ message: "Registrasi berhasil!", user, accessToken });
  } catch (err: any) {
    return c.json({ error: err.message || "Registrasi gagal" }, 400);
  }
};

/**
 * Controller untuk login user.
 */
export const loginUser = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { user, accessToken, refreshToken, refreshTokenExpiresIn } =
      await loginUserService(body);

    setCookie(c, "refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: refreshTokenExpiresIn,
    });

    return c.json({ message: "Login berhasil!", user, accessToken });
  } catch (err: any) {
    return c.json({ error: err.message || "Login gagal" }, 400);
  }
};

/**
 * Controller untuk logout user.
 * Menghapus token dari database dan dari cookie browser.
 */
export const logoutUser = async (c: Context) => {
  try {
    // 2. Gunakan getCookie untuk membaca cookie dari request
    const refreshToken = getCookie(c, "refreshToken");

    if (refreshToken) {
      await logoutUserService(refreshToken);
    }

    deleteCookie(c, "refreshToken", cookieOptions);

    return c.json({ message: "Logout berhasil" });
  } catch (err: any) {
    console.error("LOGOUT_ERROR:", err);
    return c.json({ error: "Gagal logout", details: err.message }, 500);
  }
};

/**
 * Controller untuk memperbarui (refresh) access token.
 */
export const handleRefreshToken = async (c: Context) => {
  try {
    // 2. Gunakan getCookie di sini juga
    const refreshToken = getCookie(c, "refreshToken");
    if (!refreshToken) {
      return c.json({ error: "Sesi tidak ditemukan, silakan login." }, 401);
    }

    const { accessToken } = await refreshAccessTokenService(refreshToken);

    return c.json({ accessToken });
  } catch (error: any) {
    return c.json({ error: "Sesi tidak valid, silakan login kembali." }, 403);
  }
};

// --- Handler untuk Reset Password (tidak ada perubahan, sudah benar) ---

export const forgotPassword = async (c: Context) => {
  try {
    const body = await c.req.json();
    const result = await forgotPasswordService(body);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal mengirim link reset" }, 400);
  }
};

export const resetPassword = async (c: Context) => {
  try {
    const body = await c.req.json();
    const result = await resetPasswordService(body);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message || "Gagal mereset password" }, 400);
  }
};
