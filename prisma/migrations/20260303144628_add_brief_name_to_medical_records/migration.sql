/*
  Warnings:

  - Added the required column `brief_name` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MedicalRecord" ADD COLUMN     "brief_name" TEXT NOT NULL;
