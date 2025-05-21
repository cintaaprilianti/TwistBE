import { prisma } from "../application/database";
import { PostPayload } from "../model/post.types";

export const createPost = async (userId: number, data: PostPayload) => {
  return await prisma.post.create({
    data: {
      userId,
      content: data.content,
      parentPostId: data.parentPostId,
    },
  });
};

export const getPosts = async () => {
  return await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });
};
