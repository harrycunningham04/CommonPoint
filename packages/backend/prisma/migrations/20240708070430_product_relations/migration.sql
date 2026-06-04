/*
  Warnings:

  - You are about to drop the column `productTypeId` on the `Product` table. All the data in the column will be lost.
  - Added the required column `productId` to the `ProductType` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_productTypeId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "productTypeId";

-- AlterTable
ALTER TABLE "ProductType" ADD COLUMN     "productId" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "ProductType" ADD CONSTRAINT "ProductType_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
