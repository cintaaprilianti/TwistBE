/*
  Warnings:

  - You are about to drop the column `colorTheme` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `postCount` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "colorTheme",
DROP COLUMN "postCount";
