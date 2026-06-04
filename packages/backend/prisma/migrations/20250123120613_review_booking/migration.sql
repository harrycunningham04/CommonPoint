-- CreateTable
CREATE TABLE "booking_review" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 0,
    "comment" VARCHAR(500),
    "reviewDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_review_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "booking_review" ADD CONSTRAINT "booking_review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
