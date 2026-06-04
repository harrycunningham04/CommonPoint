/*
  Warnings:

  - You are about to drop the column `editedMaterials` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `rawMaterials` on the `Booking` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BookingStage" AS ENUM ('BOOKED', 'KEYS_COLLECTED', 'CONTRACTOR_ARRIVED_ON_SITE', 'FLOORPLAN_SKETCH_UPLOADED', 'CONTRACTOR_LEFT_THE_SITE', 'CONTRACTOR_LEFT_THE_KEYS', 'RAW_PHOTOS_UPLOADED', 'PHOTOS_DELIVERED', 'FLOORPLAN_IN_PROGRESS', 'FLOORPLAN_DELIVERED', 'DONE', 'CANCELED');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('RAW', 'EDITED');

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "editedMaterials",
DROP COLUMN "rawMaterials",
ADD COLUMN     "booking_stage" "BookingStage"[] DEFAULT ARRAY[]::"BookingStage"[],
ALTER COLUMN "property_type" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Contract" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "file" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contractor_id" UUID NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterial" (
    "id" UUID NOT NULL,
    "url" VARCHAR(200) NOT NULL,
    "thumbnailUrl" VARCHAR(200),
    "contentType" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "bookingId" UUID NOT NULL,

    CONSTRAINT "RawMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditedMaterial" (
    "id" UUID NOT NULL,
    "url" VARCHAR(200) NOT NULL,
    "thumbnailUrl" VARCHAR(200),
    "contentType" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "bookingId" UUID NOT NULL,

    CONSTRAINT "EditedMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RawMaterial_bookingId_idx" ON "RawMaterial"("bookingId");

-- CreateIndex
CREATE INDEX "EditedMaterial_bookingId_idx" ON "EditedMaterial"("bookingId");

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterial" ADD CONSTRAINT "RawMaterial_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditedMaterial" ADD CONSTRAINT "EditedMaterial_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
