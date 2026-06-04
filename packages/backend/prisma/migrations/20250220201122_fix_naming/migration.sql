/*
  Warnings:

  - The values [GOLDs] on the enum `ContractorMark` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ContractorMark_new" AS ENUM ('BRONZE', 'SILVER', 'GOLD');
ALTER TABLE "EarningRate" ALTER COLUMN "mark" TYPE "ContractorMark_new" USING ("mark"::text::"ContractorMark_new");
ALTER TYPE "ContractorMark" RENAME TO "ContractorMark_old";
ALTER TYPE "ContractorMark_new" RENAME TO "ContractorMark";
DROP TYPE "ContractorMark_old";
COMMIT;
