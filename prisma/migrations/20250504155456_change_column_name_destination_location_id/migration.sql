/*
  Warnings:

  - You are about to drop the column `destination_locatuin_id` on the `Stockmovement` table. All the data in the column will be lost.
  - Added the required column `destination_location_id` to the `Stockmovement` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Stockmovement" DROP CONSTRAINT "Stockmovement_destination_locatuin_id_fkey";

-- AlterTable
ALTER TABLE "Stockmovement" DROP COLUMN "destination_locatuin_id",
ADD COLUMN     "destination_location_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Stockmovement" ADD CONSTRAINT "Stockmovement_destination_location_id_fkey" FOREIGN KEY ("destination_location_id") REFERENCES "WarehouseLocation"("location_id") ON DELETE RESTRICT ON UPDATE CASCADE;
