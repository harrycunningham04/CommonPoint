/*
  Warnings:

  - The primary key for the `ProductTypeBooking` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[bookingId]` on the table `ProductTypeBooking` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bookingGroupId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `ProductTypeBooking` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "ProductTypeBooking" DROP CONSTRAINT "ProductTypeBooking_bookingId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "bookingGroupId" UUID NOT NULL,
ADD COLUMN     "productTypeBookingId" UUID;

-- AlterTable
ALTER TABLE "ProductTypeBooking" DROP CONSTRAINT "ProductTypeBooking_pkey",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "ProductTypeBooking_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "BookingGroup" (
    "id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "b2BClientsId" UUID,
    "b2CClientsId" UUID,

    CONSTRAINT "BookingGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductTypeBooking_bookingId_key" ON "ProductTypeBooking"("bookingId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_bookingGroupId_fkey" FOREIGN KEY ("bookingGroupId") REFERENCES "BookingGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingGroup" ADD CONSTRAINT "BookingGroup_b2CClientsId_fkey" FOREIGN KEY ("b2CClientsId") REFERENCES "B2CClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingGroup" ADD CONSTRAINT "BookingGroup_b2BClientsId_fkey" FOREIGN KEY ("b2BClientsId") REFERENCES "B2BClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTypeBooking" ADD CONSTRAINT "ProductTypeBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
