/*
  Warnings:

  - You are about to drop the column `mocement_date` on the `Stockmovement` table. All the data in the column will be lost.
  - You are about to drop the column `qurity` on the `Stockmovement` table. All the data in the column will be lost.
  - Added the required column `movement_date` to the `Stockmovement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Stockmovement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stockmovement" DROP COLUMN "mocement_date",
DROP COLUMN "qurity",
ADD COLUMN     "movement_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL;
