-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationCategory" ADD VALUE 'CONTRACTOR_ARRIVED_ON_SITE';
ALTER TYPE "NotificationCategory" ADD VALUE 'CONTRACTOR_LEFT_THE_SITE';
ALTER TYPE "NotificationCategory" ADD VALUE 'CONTRACTOR_LEFT_THE_KEYS';
ALTER TYPE "NotificationCategory" ADD VALUE 'BOOKING_CONFIRMED';
ALTER TYPE "NotificationCategory" ADD VALUE 'KEYS_COLLECTED';
ALTER TYPE "NotificationCategory" ADD VALUE 'BOOKING_MATERILAS_IN_PROGRESS';
ALTER TYPE "NotificationCategory" ADD VALUE 'BOOKING_COMPLETED';
ALTER TYPE "NotificationCategory" ADD VALUE 'BOOKING_CANCELED';
ALTER TYPE "NotificationCategory" ADD VALUE 'BOOKING_DISPUTE_SOLVED';

-- CreateTable
CREATE TABLE "NotificationUserPreferences" (
    "id" UUID NOT NULL,
    "b2BClientId" UUID,
    "b2CClientId" UUID,
    "category" "NotificationCategory" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationUserPreferences_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NotificationUserPreferences" ADD CONSTRAINT "NotificationUserPreferences_b2BClientId_fkey" FOREIGN KEY ("b2BClientId") REFERENCES "B2BClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationUserPreferences" ADD CONSTRAINT "NotificationUserPreferences_b2CClientId_fkey" FOREIGN KEY ("b2CClientId") REFERENCES "B2CClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
