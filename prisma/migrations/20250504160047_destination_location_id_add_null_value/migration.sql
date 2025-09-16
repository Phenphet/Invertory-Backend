-- DropForeignKey
ALTER TABLE "Stockmovement" DROP CONSTRAINT "Stockmovement_destination_location_id_fkey";

-- AlterTable
ALTER TABLE "Stockmovement" ALTER COLUMN "destination_location_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Stockmovement" ADD CONSTRAINT "Stockmovement_destination_location_id_fkey" FOREIGN KEY ("destination_location_id") REFERENCES "WarehouseLocation"("location_id") ON DELETE SET NULL ON UPDATE CASCADE;
