/*
  Warnings:

  - Made the column `from` on table `ContractorAvailableDay` required. This step will fail if there are existing NULL values in that column.
  - Made the column `to` on table `ContractorAvailableDay` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ContractorAvailableDay" ALTER COLUMN "from" SET NOT NULL,
ALTER COLUMN "to" SET NOT NULL;
