-- CreateEnum
CREATE TYPE "RoomType" AS ENUM ('LIVING_ROOM', 'BEDROOM', 'KITCHEN', 'BATHROOM', 'OFFICE', 'DINING_ROOM', 'HALLWAY', 'OTHER');

-- CreateTable
CREATE TABLE "booking_cgi_client_photos" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "mainPhoto" VARCHAR(500) NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "roomType" "RoomType" NOT NULL,
    "examplePhotos" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_cgi_client_photos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "booking_cgi_client_photos" ADD CONSTRAINT "booking_cgi_client_photos_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
