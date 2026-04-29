/*
  Warnings:

  - A unique constraint covering the columns `[chess_username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "rapid_rating" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "users_chess_username_key" ON "users"("chess_username");
