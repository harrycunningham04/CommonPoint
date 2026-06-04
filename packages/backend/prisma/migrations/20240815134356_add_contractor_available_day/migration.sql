-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_b2CClientsId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "b2BClientsId" UUID,
ALTER COLUMN "b2CClientsId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ContractorAvailableDay" (
    "id" UUID NOT NULL,
    "date_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "from" VARCHAR(30),
    "to" VARCHAR(30),
    "contractor_id" UUID NOT NULL,

    CONSTRAINT "ContractorAvailableDay_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContractorAvailableDay" ADD CONSTRAINT "ContractorAvailableDay_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_b2CClientsId_fkey" FOREIGN KEY ("b2CClientsId") REFERENCES "B2CClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_b2BClientsId_fkey" FOREIGN KEY ("b2BClientsId") REFERENCES "B2BClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
