/*
  Warnings:

  - The values [RAW_PHOTOS_UPLOADED] on the enum `BookingStage` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "ESoftOrderType" AS ENUM ('ORDER', 'ORDER_CORRECTION');

-- AlterEnum
BEGIN;
CREATE TYPE "BookingStage_new" AS ENUM ('BOOKED', 'KEYS_COLLECTED', 'CONTRACTOR_ARRIVED_ON_SITE', 'FLOORPLAN_SKETCH_UPLOADED', 'FLOORPLAN_SKETCH_DECLINED', 'CONTRACTOR_LEFT_THE_SITE', 'CONTRACTOR_LEFT_THE_KEYS', 'RAW_MATERIALS_UPLOADED', 'PHOTOS_DELIVERED', 'FLOORPLAN_IN_PROGRESS', 'FLOORPLAN_DELIVERED', 'DONE', 'CANCELED');
ALTER TABLE "Booking" ALTER COLUMN "booking_stage" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "booking_stage" TYPE "BookingStage_new"[] USING ("booking_stage"::text::"BookingStage_new"[]);
ALTER TABLE "BookingStageHistory" ALTER COLUMN "stage" TYPE "BookingStage_new" USING ("stage"::text::"BookingStage_new");
ALTER TYPE "BookingStage" RENAME TO "BookingStage_old";
ALTER TYPE "BookingStage_new" RENAME TO "BookingStage";
DROP TYPE "BookingStage_old";
ALTER TABLE "Booking" ALTER COLUMN "booking_stage" SET DEFAULT ARRAY[]::"BookingStage"[];
COMMIT;

-- AlterTable
ALTER TABLE "ESoftOrder" ADD COLUMN     "rootOrderId" UUID,
ADD COLUMN     "type" "ESoftOrderType" NOT NULL DEFAULT 'ORDER';

-- AddForeignKey
ALTER TABLE "ESoftOrder" ADD CONSTRAINT "ESoftOrder_rootOrderId_fkey" FOREIGN KEY ("rootOrderId") REFERENCES "ESoftOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
