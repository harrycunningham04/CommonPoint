/*
  Warnings:

  - You are about to drop the column `bookingCompletedAt` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "bookingCompletedAt",
ADD COLUMN     "booking_completed_at" TIMESTAMP(3),
ADD COLUMN     "is_contractor_paid" BOOLEAN NOT NULL DEFAULT false;
