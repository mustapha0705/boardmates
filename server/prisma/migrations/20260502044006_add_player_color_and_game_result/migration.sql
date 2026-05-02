-- CreateEnum
CREATE TYPE "PlayerColor" AS ENUM ('white', 'black');

-- CreateEnum
CREATE TYPE "GameResult" AS ENUM ('win', 'lose', 'draw');

-- AlterTable
ALTER TABLE "games" ADD COLUMN     "game_result" "GameResult",
ADD COLUMN     "player_color" "PlayerColor";
