-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatisticType" ADD VALUE 'CONTRACTOR_INVOICE_CREATED';
ALTER TYPE "StatisticType" ADD VALUE 'BOOKING_DONE';
ALTER TYPE "StatisticType" ADD VALUE 'BOOKING_DONE_WITH_MISTAKE';
ALTER TYPE "StatisticType" ADD VALUE 'COMPLETED_BOOKING_DURATION';
