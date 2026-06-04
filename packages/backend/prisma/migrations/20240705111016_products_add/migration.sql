-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('BOOKING', 'ORDER');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('FLAT_APARTMENT', 'DETACHED_HOUSE', 'SEMI_DETACHED_HOUSE', 'TERRACED_HOUSE', 'BUNGALOW', 'STUDIO_FLAT', 'PENTHOUSE', 'TOWNHOUSE', 'DUPLEX_TRIPLEX');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('BOOKED', 'CANCELED', 'IN_PROGRESS', 'DONE');

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL,
    "bookingType" "BookingType" NOT NULL DEFAULT 'BOOKING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "address" VARCHAR(200),
    "property_type" "PropertyType" NOT NULL DEFAULT 'FLAT_APARTMENT',
    "number_of_bedrooms" VARCHAR(10) NOT NULL DEFAULT '3',
    "square_footage" VARCHAR(30),
    "key_instruction" VARCHAR(200),
    "key_location_address" VARCHAR(200),
    "date_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "total_sum" VARCHAR(30) NOT NULL DEFAULT '300',
    "duration" VARCHAR(30),
    "booking_status" "BookingStatus" NOT NULL DEFAULT 'BOOKED',
    "contractorId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "b2CClientsId" UUID NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_b2CClientsId_fkey" FOREIGN KEY ("b2CClientsId") REFERENCES "B2CClients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
