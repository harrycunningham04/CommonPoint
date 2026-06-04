/*
  Warnings:

  - The values [BOOKING_DONE_WITH_MISTAKE] on the enum `StatisticType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatisticType_new" AS ENUM ('BOOKING_RUNNING_LATE', 'BOOKING_RUNNING_ON_TIME', 'CONTRACTOR_INVOICE_CREATED', 'COMPLETED_BOOKING_DURATION', 'COMPLETED_BOOKING_PHOTO_COUNT', 'BOOKING_REVIEW_RATING', 'BOOKING_DONE', 'BOOKING_DONE_WITH_FLOORPLAN', 'BOOKING_DONE_WITHOUT_FLOORPLAN');
ALTER TABLE "statistic" ALTER COLUMN "type" TYPE "StatisticType_new" USING ("type"::text::"StatisticType_new");
ALTER TYPE "StatisticType" RENAME TO "StatisticType_old";
ALTER TYPE "StatisticType_new" RENAME TO "StatisticType";
DROP TYPE "StatisticType_old";
COMMIT;
