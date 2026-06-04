/*
  Warnings:

  - A unique constraint covering the columns `[productTypeId,mark]` on the table `EarningRate` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "EarningRate_mark_key";

-- CreateIndex
CREATE UNIQUE INDEX "EarningRate_productTypeId_mark_key" ON "EarningRate"("productTypeId", "mark");
