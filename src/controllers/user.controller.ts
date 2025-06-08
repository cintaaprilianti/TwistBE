import { prisma } from "../application/database";
import { Context } from "hono";
import { verifyJwt } from "../utils/jwt";
import { UserService } from "../services/user.service";

export const getAllUsers = async (c: Context) => {
  try {
    // FIXED: Use UserService instead of direct prisma call
    const dataUser = await UserService.getAllUsers();

    if (!dataUser || dataUser.length === 0) {
      return c.json({ message: "Data user kosong" }, 404);
    }

    return c.json({
      message: "Berhasil mendapatkan semua user",
      data: dataUser,
    });
  } catch (error) {
    return c.json({ message: "Internal Server Error", error }, 500);
  }
};

export const updateUserProfile = async (c: Context) => {  
  try {
    const userId = c.var.userId;
    const data = await c.req.json();

    if (Object.keys(data).length === 0) {
      return c.json(
        { error: "Tidak ada data yang dikirim untuk diupdate" },
        400
      );
    }

    const updatedUser = await UserService.updateProfile(userId, data);

    return c.json({
      message: "Profil berhasil diperbarui",
      user: updatedUser,
    });
  } catch (err: any) {
    console.error("Error updateUserProfile:", err.message);
    if (err.message === "Username atau email sudah digunakan") {
      return c.json({ error: err.message }, 409);
    }
    return c.json({ error: "Gagal memperbarui profil" }, 500);
  }
};


export const deleteUserAccount = async (c: Context) => {
  try {
    const authHeader = c.req.header("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ message: "Token tidak ditemukan" }, 401);
    }

    const token = authHeader.split(" ")[1];
    let payload: any;
    try {
      payload = verifyJwt(token);
    } catch {
      return c.json({ message: "Token tidak valid" }, 401);
    }

    const userId = payload.id;
    if (!userId || typeof userId !== "number") {
      return c.json({ message: "ID pengguna tidak valid" }, 400);
    }

    const success = await UserService.deleteUser(userId);
    if (!success) {
      return c.json({ message: "Pengguna tidak ditemukan" }, 404);
    }


    await UserService.deleteUser(userId);

    return c.json({ message: "Akun berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Gagal menghapus akun", error }, 500);
  }
};

export const getUserSuggestions = async (c: Context) => {
  try {
    const result = await UserService.getSuggestions();
    return c.json(result);
  } catch (error) {
    return c.json({ message: "Error getting user suggestions", error }, 500);
  }
};
