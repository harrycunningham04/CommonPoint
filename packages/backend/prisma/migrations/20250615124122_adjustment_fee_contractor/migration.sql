-- CreateEnum
CREATE TYPE "AdjustmentFeeType" AS ENUM ('BONUS', 'PENALTY');

-- CreateEnum
CREATE TYPE "AdjustmentFeeStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "adjustment_fee" (
    "id" UUID NOT NULL,
    "contractor_id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "status" "AdjustmentFeeStatus" NOT NULL DEFAULT 'PENDING',
    "type" "AdjustmentFeeType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adjustment_fee_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "adjustment_fee" ADD CONSTRAINT "adjustment_fee_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adjustment_fee" ADD CONSTRAINT "adjustment_fee_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
