/*
  Warnings:

  - You are about to drop the `_BookingToProductType` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_BookingToProductType" DROP CONSTRAINT "_BookingToProductType_A_fkey";

-- DropForeignKey
ALTER TABLE "_BookingToProductType" DROP CONSTRAINT "_BookingToProductType_B_fkey";

-- DropTable
DROP TABLE "_BookingToProductType";

-- CreateTable
CREATE TABLE "booking_to_product_type" (
    "booking_id" UUID NOT NULL,
    "product_type_id" UUID NOT NULL,

    CONSTRAINT "booking_to_product_type_pkey" PRIMARY KEY ("booking_id","product_type_id")
);

-- AddForeignKey
ALTER TABLE "booking_to_product_type" ADD CONSTRAINT "booking_to_product_type_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_to_product_type" ADD CONSTRAINT "booking_to_product_type_product_type_id_fkey" FOREIGN KEY ("product_type_id") REFERENCES "ProductType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
