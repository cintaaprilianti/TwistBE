import { prisma } from "../application/database";

export class FollowService {
  static async follow(userId: number, targetId: number) {
    if (userId === targetId) throw new Error("Cannot follow yourself");

    await prisma.follower.create({
      data: {
        userId,
        followingId: targetId,
      },
    });

    // Opsional: Tambah count
    await prisma.user.update({
      where: { id: targetId },
      data: { followerCount: { increment: 1 } },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { followingCount: { increment: 1 } },
    });
  }

  static async unfollow(userId: number, targetId: number) {
    await prisma.follower.delete({
      where: {
        userId_followingId: {
          userId,
          followingId: targetId,
        },
      },
    });

    await prisma.user.update({
      where: { id: targetId },
      data: { followerCount: { decrement: 1 } },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { followingCount: { decrement: 1 } },
    });
  }

  static async getFollowers(userId: number) {
    return await prisma.follower.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
  }

  static async getFollowing(userId: number) {
    return await prisma.follower.findMany({
      where: { userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
          },
        },
      },
    });
  }

  static async checkFollowStatus(userId: number, targetId: number) {
    const follow = await prisma.follower.findUnique({
      where: {
        userId_followingId: {
          userId,
          followingId: targetId,
        },
      },
    });

    return !!follow;
  }
  
  static async getTargetUserProfile(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        followerCount: true,
        followingCount: true,
        isVerified: true,
      },
    });
  }
}
