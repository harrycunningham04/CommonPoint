-- CreateTable
CREATE TABLE "ProductBooking" (
    "productId" UUID NOT NULL,
    "bookingId" UUID NOT NULL,

    CONSTRAINT "ProductBooking_pkey" PRIMARY KEY ("productId","bookingId")
);

-- AddForeignKey
ALTER TABLE "ProductBooking" ADD CONSTRAINT "ProductBooking_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductBooking" ADD CONSTRAINT "ProductBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
