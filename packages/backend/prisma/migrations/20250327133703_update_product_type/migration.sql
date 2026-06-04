/*
  Warnings:

  - You are about to drop the column `mark` on the `EarningRate` table. All the data in the column will be lost.
  - You are about to drop the column `productTypeId` on the `EarningRate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[defaultRateProductTypeId]` on the table `EarningRate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[additionalProductTypeId]` on the table `EarningRate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[individualRateProductTypeId,contractorId]` on the table `EarningRate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('PHOTOS', 'SQFT', 'BEDROOMS');

-- CreateEnum
CREATE TYPE "ProductMark" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'ALL');

-- DropForeignKey
ALTER TABLE "EarningRate" DROP CONSTRAINT "EarningRate_productTypeId_fkey";

-- DropIndex
DROP INDEX "EarningRate_productTypeId_contractorId_key";

-- DropIndex
DROP INDEX "EarningRate_productTypeId_mark_key";

-- AlterTable
ALTER TABLE "EarningRate" DROP COLUMN "mark",
DROP COLUMN "productTypeId",
ADD COLUMN     "additionalProductTypeId" UUID,
ADD COLUMN     "defaultRateProductTypeId" UUID,
ADD COLUMN     "individualRateProductTypeId" UUID;

-- CreateTable
CREATE TABLE "Adjustments" (
    "id" UUID NOT NULL,
    "type" "AdjustmentType" NOT NULL DEFAULT 'PHOTOS',
    "value" INTEGER NOT NULL DEFAULT 50,
    "productTypeId" UUID,
    "additionalProductTypeId" UUID,

    CONSTRAINT "Adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdditionalProductType" (
    "id" UUID NOT NULL,
    "productTypeId" UUID NOT NULL,

    CONSTRAINT "AdditionalProductType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Adjustments_productTypeId_key" ON "Adjustments"("productTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "Adjustments_additionalProductTypeId_key" ON "Adjustments"("additionalProductTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "AdditionalProductType_productTypeId_key" ON "AdditionalProductType"("productTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "EarningRate_defaultRateProductTypeId_key" ON "EarningRate"("defaultRateProductTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "EarningRate_additionalProductTypeId_key" ON "EarningRate"("additionalProductTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "EarningRate_individualRateProductTypeId_contractorId_key" ON "EarningRate"("individualRateProductTypeId", "contractorId");

-- AddForeignKey
ALTER TABLE "Adjustments" ADD CONSTRAINT "Adjustments_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Adjustments" ADD CONSTRAINT "Adjustments_additionalProductTypeId_fkey" FOREIGN KEY ("additionalProductTypeId") REFERENCES "AdditionalProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdditionalProductType" ADD CONSTRAINT "AdditionalProductType_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarningRate" ADD CONSTRAINT "EarningRate_individualRateProductTypeId_fkey" FOREIGN KEY ("individualRateProductTypeId") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarningRate" ADD CONSTRAINT "EarningRate_defaultRateProductTypeId_fkey" FOREIGN KEY ("defaultRateProductTypeId") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarningRate" ADD CONSTRAINT "EarningRate_additionalProductTypeId_fkey" FOREIGN KEY ("additionalProductTypeId") REFERENCES "AdditionalProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
