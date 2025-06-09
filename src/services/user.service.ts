import { PrismaClient } from "../generated/prisma";
import {
  UpdateProfileRequest,
  UserProfile,
  UserSettingsRequest,
  UserSearchResult,
} from "../model/user.types";
import { PaginationQuery } from "../model/paging";

const prisma = new PrismaClient();

export class UserService {
  static async getProfile(
    userId: number,
    currentUserId?: number
  ): Promise<UserProfile> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        followerCount: true,
        followingCount: true,
        createdAt: true,
        isVerified: true,
      },
    });

    if (!user) throw new Error("User not found");

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const follow = await prisma.follower.findUnique({
        where: {
          userId_followingId: {
            userId: currentUserId,
            followingId: userId,
          },
        },
      });
      isFollowing = !!follow;
    }

    return { ...user, isFollowing };
  }

  static async updateProfile(
    userId: number,
    data: UpdateProfileRequest
  ): Promise<UserProfile> {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data,
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          bio: true,
          followerCount: true,
          followingCount: true,
          createdAt: true,
          isVerified: true,
        },
      });

      return user;
    } catch (err: any) {
      if (err.code === "P2002") {
        throw new Error("Username atau email sudah digunakan");
      }
      throw err;
    }
  }

  static async followUser(userId: number, followingId: number): Promise<void> {
    if (userId === followingId) {
      throw new Error("Cannot follow yourself");
    }

    const existing = await prisma.follower.findUnique({
      where: {
        userId_followingId: {
          userId,
          followingId,
        },
      },
    });

    if (existing) return;

    // Create follow relationship
    await prisma.$transaction([
      prisma.follower.create({
        data: { userId, followingId },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { followingCount: { increment: 1 } },
      }),
      prisma.user.update({
        where: { id: followingId },
        data: { followerCount: { increment: 1 } },
      }),
    ]);
  }

  static async unfollowUser(
    userId: number,
    followingId: number
  ): Promise<void> {
    const follow = await prisma.follower.findUnique({
      where: {
        userId_followingId: {
          userId,
          followingId,
        },
      },
    });

    if (!follow) return;

    await prisma.$transaction([
      prisma.follower.delete({
        where: { id: follow.id },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { followingCount: { decrement: 1 } },
      }),
      prisma.user.update({
        where: { id: followingId },
        data: { followerCount: { decrement: 1 } },
      }),
    ]);
  }

  static async getFollowers(
    userId: number,
    pagination: PaginationQuery
  ): Promise<UserProfile[]> {
    const followers = await prisma.follower.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            bio: true,
            followerCount: true,
            followingCount: true,
            createdAt: true,
            isVerified: true,
          },
        },
      },
      take: pagination.limit || 20,
      skip: ((pagination.page || 1) - 1) * (pagination.limit || 20),
    });

    // FIXED: Changed from f.followers to f.follower
    return followers.map((f) => f.follower);
  }

  static async getFollowing(
    userId: number,
    pagination: PaginationQuery
  ): Promise<UserProfile[]> {
    const following = await prisma.follower.findMany({
      where: { userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            bio: true,
            followerCount: true,
            followingCount: true,
            createdAt: true,
            isVerified: true,
          },
        },
      },
      take: pagination.limit || 20,
      skip: ((pagination.page || 1) - 1) * (pagination.limit || 20),
    });

    return following.map((f) => f.following);
  }

  static async updateSettings(
    userId: number,
    data: UserSettingsRequest
  ): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  static async getSuggestions(): Promise<UserSearchResult[]> {
    return prisma.user.findMany({
      where: { isActive: true },
      orderBy: { followerCount: "desc" },
      select: {
        id: true,
        username: true,
        displayName: true,
      },
      take: 10,
    });
  }

  // ADDED: Missing getAllUsers method for controller
  static async getAllUsers(): Promise<UserProfile[]> {
    return await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        followerCount: true,
        followingCount: true,
        createdAt: true,
        isVerified: true,
      },
    });
  }

  // ADDED: Missing deleteUser method for controller
  static async deleteUser(userId: number): Promise<boolean> {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return false; // user tidak ditemukan
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return true;
  }
}
