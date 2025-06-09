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
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    throw new Error("Email atau username sudah digunakan");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, email, passwordHash },
  });

  const token = signJwt({ id: user.id, username: user.username, type: "login" }, "15m");
  const refreshTokenExpiresInSeconds = 7 * 24 * 60 * 60;
  const refreshToken = signJwt({ userId: user.id }, `${refreshTokenExpiresInSeconds}s`);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + refreshTokenExpiresInSeconds * 1000),
    },
  });

  return {
    user: { id: user.id, username: user.username, email: user.email },
    token,
    refreshToken,
    refreshTokenExpiresIn: refreshTokenExpiresInSeconds,
  };
};

export const loginUserService = async (data: LoginInput) => {
  const { username, password } = data;

  if (!username || !password) {
    throw new Error("Username atau password wajib diisi");
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: username }, { username: username }] },
  });

  if (!user || !user.passwordHash) {
    throw new Error("User tidak ditemukan atau akun tidak memiliki password.");
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new Error("Password salah");
  }

  const token = signJwt({ id: user.id, username: user.username, type: "login" }, "15m");
  const refreshTokenExpiresInSeconds = 7 * 24 * 60 * 60;
  const refreshToken = signJwt({ userId: user.id }, `${refreshTokenExpiresInSeconds}s`);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + refreshTokenExpiresInSeconds * 1000),
    },
  });

  return {
    user: { id: user.id, username: user.username, email: user.email },
    token,
    refreshToken,
    refreshTokenExpiresIn: refreshTokenExpiresInSeconds,
  };
};

export const logoutUserService = async (refreshToken: string) => {
  return prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
};

export const refreshAccessTokenService = async (token: string) => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token, expiresAt: { gt: new Date() } },
  });

  if (!storedToken) {
    throw new Error("Refresh token tidak valid atau sudah kedaluwarsa");
  }

  const user = await prisma.user.findUnique({ where: { id: storedToken.userId } });
  if (!user) {
    throw new Error("User tidak ditemukan");
  }

  const newToken = signJwt({ id: user.id, username: user.username, type: "login" }, "15m");
  return { token: newToken };
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

  const resetToken = signJwt({ id: user.id, email: user.email, type: "reset_password" }, "1h");
  const resetTokenExpiry = new Date(Date.now() + 3600000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry },
  });

  return {
    message: "Link untuk reset password telah dikirim",
    resetToken,
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
    const decoded = verifyJwt(token) as any;

    if (decoded.type !== "reset_password") {
      throw new Error("Token tidak valid untuk reset password");
    }

    const user = await prisma.user.findFirst({
      where: { id: decoded.id, resetToken: token, resetTokenExpiry: { gt: new Date() } },
    });

    if (!user) {
      throw new Error("Token reset password tidak valid atau sudah kedaluwarsa");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });

    return { message: "Password berhasil direset" };
  } catch (error: any) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      throw new Error("Token tidak valid atau sudah kedaluwarsa");
    }
    throw error;
  }
};