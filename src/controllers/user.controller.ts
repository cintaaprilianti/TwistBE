import { prisma } from "../application/database";
import { Context } from "hono";
import { verifyJwt } from "../utils/jwt";
import { updateUserService } from "../services/user.service";


export const getAllUsers = async (c: Context) => {
  try {
    const dataUser = await prisma.user.findMany();

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

    const updatedUser = await updateUserService(userId, data);

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

    // Hapus akun user dari database
    await prisma.user.delete({ where: { id: userId } });

    return c.json({ message: "Akun berhasil dihapus" });
  } catch (error) {
    console.error(error);
    return c.json({ message: "Gagal menghapus akun", error }, 500);
  }
};