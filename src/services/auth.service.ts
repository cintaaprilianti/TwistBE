import { prisma } from "../application/database";
import bcrypt from "bcryptjs";
import { signJwt } from "../utils/jwt";
import { LoginInput, RegisterInput } from "../model/auth.types";


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

  const token = signJwt({ id: user.id });

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

  const token = signJwt({ id: user.id });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,

    },
    token,
  };
};

