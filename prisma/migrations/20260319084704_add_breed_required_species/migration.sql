/*
  Warnings:

  - Made the column `species` on table `Pet` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Pet" ADD COLUMN     "breed" TEXT,
ALTER COLUMN "species" SET NOT NULL;
