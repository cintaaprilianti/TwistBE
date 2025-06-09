// services/profile.service.ts
import { prisma } from "../application/database"; // Sesuaikan dengan setup prisma Anda


export const getProfile = async (username: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        followerCount: true,
        followingCount: true,
        createdAt: true,
        isVerified: true,
        isActive: true,
        _count: {
          select: {
            posts: {
              where: { isDeleted: false },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      followerCount: user.followerCount,
      followingCount: user.followingCount,
      postsCount: user._count.posts,
      createdAt: user.createdAt,
      isVerified: user.isVerified,
      isActive: user.isActive,
    };
  } catch (error) {
    console.error("Error in getProfile service:", error);
    throw error;
  }
};

export const getProfilePosts = async (
  username: string,
  options: {
    tab: string;
    limit: number;
    offset?: number;
  }
) => {
  const { tab, limit, offset = 0 } = options;

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const baseInclude = {
    user: {
      select: {
        id: true,
        username: true,
        displayName: true,
        isVerified: true,
      },
    },
    _count: {
      select: {
        likes: true,
        comments: true,
        reposts: true,
      },
    },
  };

  switch (tab) {
    case "posts":
      return prisma.post.findMany({
        where: {
          userId: user.id,
          isDeleted: false,
          parentPostId: null, // Hanya posts utama, bukan replies
        },
        include: baseInclude,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

    case "likes":
      return prisma.post.findMany({
        where: {
          likes: {
            some: { userId: user.id },
          },
          isDeleted: false,
        },
        include: baseInclude,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

    case "replies":
      return prisma.post.findMany({
        where: {
          userId: user.id,
          parentPostId: { not: null }, // Post yang merupakan reply
          isDeleted: false,
        },
        include: {
          ...baseInclude,
          parentPost: {
            select: {
              id: true,
              content: true,
              user: {
                select: {
                  username: true,
                  displayName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

    case "reposts":
      // Ambil posts yang di-repost oleh user ini
      const reposts = await prisma.repost.findMany({
        where: { userId: user.id },
        include: {
          post: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  isVerified: true,
                },
              },
              _count: {
                select: {
                  likes: true,
                  comments: true,
                  reposts: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

      // Transform data untuk menyesuaikan format response
      return reposts.map((repost) => ({
        ...repost.post,
        repostedAt: repost.createdAt,
        isQuotePost: repost.isQuotePost,
        quoteContent: repost.quoteContent,
        repostedBy: {
          id: user.id,
          username: username,
        },
      }));

    default:
      throw new Error("Invalid tab parameter");
  }
};
