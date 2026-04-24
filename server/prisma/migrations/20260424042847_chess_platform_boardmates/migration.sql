/*
  Warnings:

  - You are about to drop the column `rating` on the `users` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ChessPlatform" AS ENUM ('chess_com', 'lichess');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "rating",
ADD COLUMN     "chess_platform" "ChessPlatform";
