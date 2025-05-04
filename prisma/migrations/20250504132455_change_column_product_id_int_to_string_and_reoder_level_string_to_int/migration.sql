/*
  Warnings:

  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `reoder_level` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Stockmovement" DROP CONSTRAINT "Stockmovement_product_id_fkey";

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
ALTER COLUMN "product_id" DROP DEFAULT,
ALTER COLUMN "product_id" SET DATA TYPE TEXT,
DROP COLUMN "reoder_level",
ADD COLUMN     "reoder_level" INTEGER NOT NULL,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("product_id");
DROP SEQUENCE "Product_product_id_seq";

-- AlterTable
ALTER TABLE "Stockmovement" ALTER COLUMN "product_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Stockmovement" ADD CONSTRAINT "Stockmovement_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;
