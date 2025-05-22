import { prisma } from "../application/database";
import bcrypt from "bcryptjs";
import { signJwt, verifyJwt } from "../utils/jwt";
import {
  LoginInput,
  RegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../model/auth.types";

export const registerUserService = async (data: RegisterInput) => {
  const { username, email, password, confirmPassword } = data;

  if (!username || !email || !password || !confirmPassword) {
    throw new Error("Semua field wajib diisi");
  }

  if (password !== confirmPassword) {
    throw new Error("Password dan konfirmasi tidak cocok");
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existing) {
    throw new Error("Email atau username sudah digunakan");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
      isVerified: false,
      isActive: true,
    },
  });

  const token = signJwt({ id: user.id, type: "login" });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const loginUserService = async (data: LoginInput) => {
  const { username, password } = data;

  if (!username || !password) {
    throw new Error("Email dan password wajib diisi");
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new Error("Password salah");
  }

  const token = signJwt({ id: user.id, type: "login" });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    token,
  };
};

export const forgotPasswordService = async (data: ForgotPasswordInput) => {
  const { email } = data;

  if (!email) {
    throw new Error("Email wajib diisi");
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new Error("Email tidak terdaftar");
  }

  // Generate JWT token khusus untuk reset password
  const resetToken = signJwt(
    {
      id: user.id,
      email: user.email,
      type: "reset_password",
    },
    "1h" // expire 1 jam
  );

  const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

  // Simpan token ke database untuk tracking
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetToken,
      resetTokenExpiry,
    },
  });

  // Untuk development - return token langsung (nanti bisa diganti email service)
  console.log("=== RESET PASSWORD TOKEN (Development) ===");
  console.log(`Email: ${email}`);
  console.log(`Reset Token: ${resetToken}`);
  console.log(
    `Reset URL: http://localhost:3000/reset-password?token=${resetToken}`
  );
  console.log("==========================================");

  return {
    message: "Reset token berhasil digenerate",
    resetToken, // Untuk development, nanti dihapus di production
    resetLink: `http://localhost:3000/reset-password?token=${resetToken}`,
  };
};

export const resetPasswordService = async (data: ResetPasswordInput) => {
  const { token, password, confirmPassword } = data;

  if (!token || !password || !confirmPassword) {
    throw new Error("Token, password, dan konfirmasi password wajib diisi");
  }

  if (password !== confirmPassword) {
    throw new Error("Password dan konfirmasi tidak cocok");
  }

  if (password.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }

  try {
    // Verify JWT token
    const decoded = verifyJwt(token) as any;

    // Cek apakah token adalah untuk reset password
    if (decoded.type !== "reset_password") {
      throw new Error("Token tidak valid untuk reset password");
    }

    // Cek apakah user dan token masih valid di database
    const user = await prisma.user.findFirst({
      where: {
        id: decoded.id,
        email: decoded.email,
        resetToken: token, // Token harus sama dengan yang tersimpan
        resetTokenExpiry: {
          gt: new Date(), // Token belum expired
        },
      },
    });

    if (!user) {
      throw new Error("Token reset password tidak valid atau sudah expired");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Update password dan hapus reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return {
      message: "Password berhasil direset",
    };
  } catch (error: any) {
    if (error.name === "JsonWebTokenError") {
      throw new Error("Token tidak valid");
    }
    if (error.name === "TokenExpiredError") {
      throw new Error("Token sudah expired");
    }
    throw error;
  }
};
