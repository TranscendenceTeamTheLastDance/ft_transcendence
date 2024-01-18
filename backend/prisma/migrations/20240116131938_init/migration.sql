/*
  Warnings:

  - You are about to drop the column `userPictu` on the `Users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Users" DROP COLUMN "userPictu",
ADD COLUMN     "profilePic" TEXT,
ADD COLUMN     "twoFactorEnabled" BOOLEAN DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;
