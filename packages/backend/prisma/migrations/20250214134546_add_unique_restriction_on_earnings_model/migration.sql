/*
  Warnings:

  - A unique constraint covering the columns `[productTypeId,contractorId]` on the table `EarningRate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EarningRate_productTypeId_contractorId_key" ON "EarningRate"("productTypeId", "contractorId");
