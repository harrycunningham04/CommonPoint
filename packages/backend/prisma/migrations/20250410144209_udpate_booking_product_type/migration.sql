/*
  Warnings:

  - You are about to drop the column `productTypeId` on the `Booking` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_productTypeId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "productTypeId";

-- CreateTable
CREATE TABLE "_BookingToProductType" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BookingToProductType_AB_unique" ON "_BookingToProductType"("A", "B");

-- CreateIndex
CREATE INDEX "_BookingToProductType_B_index" ON "_BookingToProductType"("B");

-- AddForeignKey
ALTER TABLE "_BookingToProductType" ADD CONSTRAINT "_BookingToProductType_A_fkey" FOREIGN KEY ("A") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookingToProductType" ADD CONSTRAINT "_BookingToProductType_B_fkey" FOREIGN KEY ("B") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
