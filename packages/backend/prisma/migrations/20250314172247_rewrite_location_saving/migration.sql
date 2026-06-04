/*
  Warnings:

  - You are about to drop the column `contractor_id` on the `Location` table. All the data in the column will be lost.
  - Made the column `booking_id` on table `Location` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Location" DROP CONSTRAINT "Location_contractor_id_fkey";

-- DropIndex
DROP INDEX "Location_contractor_id_key";

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "contractor_id",
ALTER COLUMN "booking_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "contractor" ADD COLUMN     "locationId" UUID;

-- CreateTable
CREATE TABLE "KeyLocation" (
    "id" UUID NOT NULL,
    "place_id" VARCHAR(100),
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "booking_id" UUID NOT NULL,

    CONSTRAINT "KeyLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorLocation" (
    "id" UUID NOT NULL,
    "place_id" VARCHAR(100),
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "contractor_id" UUID NOT NULL,

    CONSTRAINT "ContractorLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KeyLocation_booking_id_key" ON "KeyLocation"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "ContractorLocation_contractor_id_key" ON "ContractorLocation"("contractor_id");

-- AddForeignKey
ALTER TABLE "KeyLocation" ADD CONSTRAINT "KeyLocation_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorLocation" ADD CONSTRAINT "ContractorLocation_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
