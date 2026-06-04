/*
  Warnings:

  - You are about to drop the column `ProductTypeBookingId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `bookingId` on the `ClientInvoiceB2B` table. All the data in the column will be lost.
  - You are about to drop the `ProductBooking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductTypeBooking` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productTypeId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bookingGroupId` to the `ClientInvoiceB2B` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ClientInvoiceB2B" DROP CONSTRAINT "ClientInvoiceB2B_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "ProductBooking" DROP CONSTRAINT "ProductBooking_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "ProductBooking" DROP CONSTRAINT "ProductBooking_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductTypeBooking" DROP CONSTRAINT "ProductTypeBooking_bookingId_fkey";

-- DropForeignKey
ALTER TABLE "ProductTypeBooking" DROP CONSTRAINT "ProductTypeBooking_productTypeId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "ProductTypeBookingId",
ADD COLUMN     "durationSettings" "BookingDuration"[] DEFAULT ARRAY[]::"BookingDuration"[],
ADD COLUMN     "packageId" UUID,
ADD COLUMN     "preferences" "BookingPreference"[] DEFAULT ARRAY[]::"BookingPreference"[],
ADD COLUMN     "productTypeId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "ClientInvoiceB2B" DROP COLUMN "bookingId",
ADD COLUMN     "bookingGroupId" UUID NOT NULL;

-- DropTable
DROP TABLE "ProductBooking";

-- DropTable
DROP TABLE "ProductTypeBooking";

-- AddForeignKey
ALTER TABLE "ClientInvoiceB2B" ADD CONSTRAINT "ClientInvoiceB2B_bookingGroupId_fkey" FOREIGN KEY ("bookingGroupId") REFERENCES "BookingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE SET NULL ON UPDATE CASCADE;
