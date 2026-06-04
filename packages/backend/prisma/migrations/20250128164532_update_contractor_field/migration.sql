/*
  Warnings:

  - The values [BLUE_PERSONAL_PHOTOS] on the enum `BookingPreference` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `transportacion` on the `contractor` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BookingPreference_new" AS ENUM ('SLOW', 'FAST', 'PROPERTY_ADDRESS_INFO', 'BLUR_PERSONAL_PHOTOS', 'ELEVATE_EXTERNAL', 'X2_PORTRAIT', 'WIDE_ANGLE', 'X2_DETAIL', 'COLOURED', 'BLACK_AND_WHITE', 'ENHANCED_ACCESSIBILITY');
ALTER TABLE "ProductTypeBooking" ALTER COLUMN "preferences" DROP DEFAULT;
ALTER TABLE "ProductTypeBooking" ALTER COLUMN "preferences" TYPE "BookingPreference_new"[] USING ("preferences"::text::"BookingPreference_new"[]);
ALTER TYPE "BookingPreference" RENAME TO "BookingPreference_old";
ALTER TYPE "BookingPreference_new" RENAME TO "BookingPreference";
DROP TYPE "BookingPreference_old";
ALTER TABLE "ProductTypeBooking" ALTER COLUMN "preferences" SET DEFAULT ARRAY[]::"BookingPreference"[];
COMMIT;

-- AlterTable
ALTER TABLE "contractor" DROP COLUMN "transportacion",
ADD COLUMN     "transportation" "ContractorTransportation" NOT NULL DEFAULT 'PUBLIC_TRANSPORTATION';
