-- DropForeignKey
ALTER TABLE "reposts" DROP CONSTRAINT "reposts_userId_fkey";

-- AddForeignKey
ALTER TABLE "reposts" ADD CONSTRAINT "reposts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
