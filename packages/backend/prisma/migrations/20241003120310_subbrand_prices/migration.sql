/*
  Warnings:

  - A unique constraint covering the columns `[productTypeId,subbrandId]` on the table `ProductTypeSpecialPrice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProductTypeSpecialPrice_productTypeId_subbrandId_key" ON "ProductTypeSpecialPrice"("productTypeId", "subbrandId");
