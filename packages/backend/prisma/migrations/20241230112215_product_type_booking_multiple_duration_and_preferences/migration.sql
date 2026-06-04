-- CreateEnum
CREATE TYPE "BookingDuration" AS ENUM ('SEC_45', 'SEC_120', 'AGENT_INTRO', 'VOICE_OVER');

-- CreateEnum
CREATE TYPE "BookingPreference" AS ENUM ('SLOW', 'FAST', 'PROPERTY_ADDRESS_INFO', 'BLUE_PERSONAL_PHOTOS');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationCategory" ADD VALUE 'NEW_PRODUCT_AVAILABLE';
ALTER TYPE "NotificationCategory" ADD VALUE 'NEW_COUPON_ACTIVE';
ALTER TYPE "NotificationCategory" ADD VALUE 'UPDATE_TERMS_AND_CONDITIONS';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'UPDATES';

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "isRead" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ProductTypeBooking" ADD COLUMN     "durationSettings" "BookingDuration"[] DEFAULT ARRAY[]::"BookingDuration"[],
ADD COLUMN     "preferences" "BookingPreference"[] DEFAULT ARRAY[]::"BookingPreference"[];
