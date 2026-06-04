-- CreateTable
CREATE TABLE "Location" (
    "id" UUID NOT NULL,
    "place_id" VARCHAR(100),
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "booking_id" UUID,
    "contractor_id" UUID,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Location_booking_id_key" ON "Location"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "Location_contractor_id_key" ON "Location"("contractor_id");

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
