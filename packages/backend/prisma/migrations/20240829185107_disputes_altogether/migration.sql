/*
  Warnings:

  - You are about to drop the column `offices` on the `B2BClients` table. All the data in the column will be lost.
  - You are about to drop the column `client_id` on the `ClientDispute` table. All the data in the column will be lost.
  - You are about to drop the column `client_type` on the `ClientDispute` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('SENT', 'AWAITING_PAYMENT', 'PAID', 'CANCELED', 'REPORTED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'STRIPE', 'OTHER');

-- CreateEnum
CREATE TYPE "OfficeType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "OfficeClientType" AS ENUM ('SALES', 'LETTINGS', 'OTHER');

-- AlterTable
ALTER TABLE "B2BClients" DROP COLUMN "offices";

-- AlterTable
ALTER TABLE "ClientDispute" DROP COLUMN "client_id",
DROP COLUMN "client_type",
ADD COLUMN     "b2BClientId" UUID,
ADD COLUMN     "b2CClientId" UUID,
ADD COLUMN     "clientInvoiceB2BId" UUID;

-- CreateTable
CREATE TABLE "Office" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL DEFAULT '',
    "phone_number" VARCHAR(30) NOT NULL DEFAULT '',
    "email" VARCHAR(50) NOT NULL DEFAULT '',
    "address_coordinates" VARCHAR(200),
    "billing_address" VARCHAR(200) NOT NULL DEFAULT '',
    "admin_id" UUID NOT NULL,
    "b2BClientsId" UUID NOT NULL,
    "preference_id" UUID NOT NULL,
    "officeType" "OfficeType" NOT NULL DEFAULT 'RESIDENTIAL',
    "officeClientType" "OfficeClientType" NOT NULL DEFAULT 'SALES',

    CONSTRAINT "Office_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientInvoiceB2B" (
    "id" UUID NOT NULL,
    "sum" VARCHAR(50) NOT NULL DEFAULT '',
    "billing_address" VARCHAR(200) NOT NULL DEFAULT '',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'BANK_TRANSFER',
    "file" TEXT,
    "admin_id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "officeId" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientInvoiceB2B_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_b2BClientsId_fkey" FOREIGN KEY ("b2BClientsId") REFERENCES "B2BClients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_preference_id_fkey" FOREIGN KEY ("preference_id") REFERENCES "Preference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDispute" ADD CONSTRAINT "ClientDispute_b2CClientId_fkey" FOREIGN KEY ("b2CClientId") REFERENCES "B2CClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDispute" ADD CONSTRAINT "ClientDispute_b2BClientId_fkey" FOREIGN KEY ("b2BClientId") REFERENCES "B2BClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDispute" ADD CONSTRAINT "ClientDispute_clientInvoiceB2BId_fkey" FOREIGN KEY ("clientInvoiceB2BId") REFERENCES "ClientInvoiceB2B"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientInvoiceB2B" ADD CONSTRAINT "ClientInvoiceB2B_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientInvoiceB2B" ADD CONSTRAINT "ClientInvoiceB2B_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientInvoiceB2B" ADD CONSTRAINT "ClientInvoiceB2B_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;
