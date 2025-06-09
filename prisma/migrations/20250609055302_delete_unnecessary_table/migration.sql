/*
  Warnings:

  - You are about to drop the `user_activities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_profile_tabs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "user_activities" DROP CONSTRAINT "user_activities_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_profile_tabs" DROP CONSTRAINT "user_profile_tabs_userId_fkey";

-- DropTable
DROP TABLE "user_activities";

-- DropTable
DROP TABLE "user_profile_tabs";
