-- CreateEnum
CREATE TYPE "EarningRateType" AS ENUM ('PERCENTAGE', 'POUNDS');

-- CreateEnum
CREATE TYPE "EarningRateScope" AS ENUM ('DEFAULT', 'INDIVIDUAL');

-- CreateTable
CREATE TABLE "EarningRate" (
    "id" UUID NOT NULL,
    "rateType" "EarningRateType" NOT NULL DEFAULT 'PERCENTAGE',
    "rateScope" "EarningRateScope" NOT NULL DEFAULT 'DEFAULT',
    "earningRate" INTEGER NOT NULL DEFAULT 50,
    "productTypeId" UUID NOT NULL,
    "contractorId" UUID,

    CONSTRAINT "EarningRate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EarningRate" ADD CONSTRAINT "EarningRate_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EarningRate" ADD CONSTRAINT "EarningRate_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
