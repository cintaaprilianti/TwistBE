import { prisma } from "../application/database";

export const updateUserService = async (userId: number, data: any) => {
  // Siapkan kondisi OR
  const orConditions = [];
  if (data.username) {
    orConditions.push({ username: data.username });
  }
  if (data.email) {
    orConditions.push({ email: data.email });
  }

  // Cek jika username/email sudah digunakan oleh user lain
  if (orConditions.length > 0) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: orConditions,
        NOT: { id: userId },
      },
    });

    if (existingUser) {
      throw new Error("Username atau email sudah digunakan oleh user lain.");
    }
  }

  // Update data user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  return updatedUser;
};
