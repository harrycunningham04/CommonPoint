/*
  Warnings:

  - You are about to drop the column `productTypeId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `_ProductToProductType` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productId` to the `ProductType` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ProductToProductType" DROP CONSTRAINT "_ProductToProductType_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductToProductType" DROP CONSTRAINT "_ProductToProductType_B_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "productTypeId";

-- AlterTable
ALTER TABLE "ProductType" ADD COLUMN     "productId" UUID NOT NULL;

-- DropTable
DROP TABLE "_ProductToProductType";

-- AddForeignKey
ALTER TABLE "ProductType" ADD CONSTRAINT "ProductType_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
