/*
  Warnings:

  - You are about to drop the column `productId` on the `ProductType` table. All the data in the column will be lost.
  - Added the required column `productTypeId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductType" DROP CONSTRAINT "ProductType_productId_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "productTypeId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "ProductType" DROP COLUMN "productId";

-- CreateTable
CREATE TABLE "_ProductToProductType" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductToProductType_AB_unique" ON "_ProductToProductType"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductToProductType_B_index" ON "_ProductToProductType"("B");

-- AddForeignKey
ALTER TABLE "_ProductToProductType" ADD CONSTRAINT "_ProductToProductType_A_fkey" FOREIGN KEY ("A") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductToProductType" ADD CONSTRAINT "_ProductToProductType_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
