/*
  Warnings:

  - You are about to drop the column `rateScope` on the `EarningRate` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mark]` on the table `EarningRate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ContractorMark" AS ENUM ('BRONZE', 'SILVER', 'GOLDs');

-- AlterTable
ALTER TABLE "EarningRate" DROP COLUMN "rateScope",
ADD COLUMN     "mark" "ContractorMark";

-- DropEnum
DROP TYPE "EarningRateScope";

-- CreateIndex
CREATE UNIQUE INDEX "EarningRate_mark_key" ON "EarningRate"("mark");
