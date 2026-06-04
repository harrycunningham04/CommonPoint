-- CreateTable
CREATE TABLE "Attachment" (
    "id" UUID NOT NULL,
    "booking_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL DEFAULT '',
    "size" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "url" VARCHAR(200) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
