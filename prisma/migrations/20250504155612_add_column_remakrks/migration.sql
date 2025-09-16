/*
  Warnings:

  - Added the required column `remarks` to the `Stockmovement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stockmovement" ADD COLUMN     "remarks" TEXT NOT NULL;
