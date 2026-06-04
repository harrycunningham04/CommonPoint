/*
  Warnings:

  - You are about to drop the column `productTypeBookingId` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "productTypeBookingId",
ADD COLUMN     "ProductTypeBookingId" UUID;
