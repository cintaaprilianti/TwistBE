// search.service.ts
import { prisma } from "../application/database";

export class SearchService {
  static async searchUsers(query: string, limit: number = 10) {
    return prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            displayName: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        followerCount: true,
        followingCount: true,
        isVerified: true,
      },
      take: limit,
      orderBy: [
        { isVerified: "desc" },
        { followerCount: "desc" },
        { username: "asc" },
      ],
    });
  }

  static async searchPosts(query: string, limit: number = 20) {
    return prisma.post.findMany({
      where: {
        content: {
          contains: query,
          mode: "insensitive",
        },
        isDeleted: false,
      },
      select: {
        id: true,
        content: true,
        likeCount: true,
        commentCount: true,
        repostCount: true,
        createdAt: true,
        updatedAt: true,
        isEdited: true,
        isPinned: true,
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            isVerified: true,
          },
        },
      },
      take: limit,
      orderBy: [{ createdAt: "desc" }],
    });
  }

  static async getSearchSuggestions(query: string, limit: number = 5) {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: {
              startsWith: query,
              mode: "insensitive",
            },
          },
          {
            displayName: {
              startsWith: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        isVerified: true,
      },
      take: limit,
      orderBy: [{ isVerified: "desc" }, { followerCount: "desc" }],
    });

    return users;
  }
}
