/*
  Warnings:

  - You are about to alter the column `earningRate` on the `EarningRate` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "EarningRate" ALTER COLUMN "earningRate" SET DATA TYPE DOUBLE PRECISION;
