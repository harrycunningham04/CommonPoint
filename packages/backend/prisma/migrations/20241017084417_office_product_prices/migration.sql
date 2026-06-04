/*
  Warnings:

  - A unique constraint covering the columns `[productTypeId,officeId]` on the table `ProductTypeSpecialPrice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ProductTypeSpecialPrice" ADD COLUMN     "officeId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "ProductTypeSpecialPrice_productTypeId_officeId_key" ON "ProductTypeSpecialPrice"("productTypeId", "officeId");

-- AddForeignKey
ALTER TABLE "ProductTypeSpecialPrice" ADD CONSTRAINT "ProductTypeSpecialPrice_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;
