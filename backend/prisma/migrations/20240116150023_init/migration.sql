-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "twoFactorAuth" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "twoFactorSecret" TEXT;
