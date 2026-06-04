/*
  Warnings:

  - The `mark` column on the `contractor` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "contractor" DROP COLUMN "mark",
ADD COLUMN     "mark" "ContractorMark" NOT NULL DEFAULT 'BRONZE';
