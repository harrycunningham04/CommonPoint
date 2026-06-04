/*
  Warnings:

  - The `from` column on the `ContractorAvailableDay` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `to` column on the `ContractorAvailableDay` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ContractorAvailableDay" DROP COLUMN "from",
ADD COLUMN     "from" VARCHAR(30)[],
DROP COLUMN "to",
ADD COLUMN     "to" VARCHAR(30)[];
