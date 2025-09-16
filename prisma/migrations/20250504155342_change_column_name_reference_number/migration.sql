/*
  Warnings:

  - You are about to drop the column `referenc_number` on the `Stockmovement` table. All the data in the column will be lost.
  - Added the required column `reference_number` to the `Stockmovement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stockmovement" DROP COLUMN "referenc_number",
ADD COLUMN     "reference_number" INTEGER NOT NULL;
