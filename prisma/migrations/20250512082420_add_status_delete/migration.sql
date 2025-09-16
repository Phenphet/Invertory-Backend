-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "status_delete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "status_delete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Stockmovement" ADD COLUMN     "status_delete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "status_delete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "WarehouseLocation" ADD COLUMN     "status_delete" BOOLEAN NOT NULL DEFAULT false;
