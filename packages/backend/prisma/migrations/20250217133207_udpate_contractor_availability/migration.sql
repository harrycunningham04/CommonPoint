/*
  Warnings:

  - You are about to drop the column `from` on the `ContractorAvailableDay` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `ContractorAvailableDay` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContractorAvailableDay" DROP COLUMN "from",
DROP COLUMN "to",
ADD COLUMN     "availability" INTEGER[];
