-- DropForeignKey
ALTER TABLE "Stockmovement" DROP CONSTRAINT "Stockmovement_source_location_id_fkey";

-- AlterTable
ALTER TABLE "Stockmovement" ALTER COLUMN "source_location_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Stockmovement" ADD CONSTRAINT "Stockmovement_source_location_id_fkey" FOREIGN KEY ("source_location_id") REFERENCES "WarehouseLocation"("location_id") ON DELETE SET NULL ON UPDATE CASCADE;
