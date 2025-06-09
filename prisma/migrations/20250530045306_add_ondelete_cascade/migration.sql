-- DropForeignKey
ALTER TABLE "comments" DROP CONSTRAINT "comments_postId_fkey";

-- DropForeignKey
ALTER TABLE "likes" DROP CONSTRAINT "likes_postId_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_parentPostId_fkey";

-- DropForeignKey
ALTER TABLE "reposts" DROP CONSTRAINT "reposts_postId_fkey";

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_parentPostId_fkey" FOREIGN KEY ("parentPostId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reposts" ADD CONSTRAINT "reposts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
