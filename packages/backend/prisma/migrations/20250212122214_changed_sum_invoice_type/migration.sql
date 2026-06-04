/*
  Warnings:

  - The `sum` column on the `ContractorInvoice` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ContractorInvoice" DROP COLUMN "sum",
ADD COLUMN     "sum" DOUBLE PRECISION NOT NULL DEFAULT 0;
