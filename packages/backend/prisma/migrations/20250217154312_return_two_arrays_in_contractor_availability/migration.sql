/*
  Warnings:

  - You are about to drop the column `availability` on the `ContractorAvailableDay` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ContractorAvailableDay" DROP COLUMN "availability",
ADD COLUMN     "from" INTEGER[],
ADD COLUMN     "to" INTEGER[];
