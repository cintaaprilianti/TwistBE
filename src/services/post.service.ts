import { prisma } from "../application/database";

export const createPost = async (userId: number, data: { content: string }) => {
  return prisma.post.create({
    data: {
      userId,
      content: data.content,
    },
  });
};

export const getPosts = async () => {
  return prisma.post.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });
};

export const getPostDetail = async (postId: number) => {
  return prisma.post.findUnique({
    where: { id: postId },
    include: { user: true, comments: true, likes: true, reposts: true },
  });
};

export const updatePost = async (
  userId: number,
  postId: number,
  content: string
) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.userId !== userId || post.isDeleted) return null;

  return prisma.post.update({
    where: { id: postId },
    data: { content, isEdited: true },
  });
};

export const deletePost = async (userId: number, postId: number) => {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.userId !== userId || post.isDeleted) return false;

  await prisma.post.delete({
    where: { id: postId },
  });
  return true;
};

export const toggleLikePost = async (userId: number, postId: number) => {
  const existing = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
  });
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { decrement: 1 } },
    });
    return false;
  } else {
    await prisma.like.create({ data: { userId, postId } });
    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });
    return true;
  }
};

export const toggleRepost = async (userId: number, postId: number) => {
  const existing = await prisma.repost.findFirst({
    where: { userId, postId, isQuotePost: false },
  });
  if (existing) {
    await prisma.repost.delete({ where: { id: existing.id } });
    await prisma.post.update({
      where: { id: postId },
      data: { repostCount: { decrement: 1 } },
    });
    return false;
  } else {
    await prisma.repost.create({ data: { userId, postId } });
    await prisma.post.update({
      where: { id: postId },
      data: { repostCount: { increment: 1 } },
    });
    return true;
  }
};

export const quotePost = async (
  userId: number,
  postId: number,
  quoteContent: string
) => {
  const post = await prisma.repost.create({
    data: {
      userId,
      postId,
      quoteContent,
      isQuotePost: true,
    },
  });

  await prisma.post.update({
    where: { id: postId },
    data: { repostCount: { increment: 1 } },
  });
  return post;
};

export const getPostComments = async (postId: number) => {
  return prisma.comment.findMany({
    where: { postId, isDeleted: false },
    orderBy: { createdAt: "asc" },
    include: { user: true },
  });
};

export const addComment = async (
  userId: number,
  postId: number,
  content: string
) => {
  const comment = await prisma.comment.create({
    data: {
      userId,
      postId,
      content,
    },
    include: { user: true },
  });
  await prisma.post.update({
    where: { id: postId },
    data: { commentCount: { increment: 1 } },
  });
  return comment;
};
