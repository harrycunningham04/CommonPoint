-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('B2B', 'B2C');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('IN_PROGRESS', 'UNSOLVED', 'DONE');

-- CreateEnum
CREATE TYPE "DisputeTheme" AS ENUM ('BOOKING', 'INVOICE');

-- CreateEnum
CREATE TYPE "InvoiceContractor" AS ENUM ('PAID', 'PENDING', 'REPORTED', 'CANCELED');

-- CreateTable
CREATE TABLE "ContractorDispute" (
    "id" UUID NOT NULL,
    "theme" "DisputeTheme" NOT NULL DEFAULT 'BOOKING',
    "status" "DisputeStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "description" VARCHAR(100) NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contractor_id" UUID NOT NULL,
    "contractorInvoiceId" UUID NOT NULL,
    "bookingId" UUID NOT NULL,

    CONSTRAINT "ContractorDispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientDispute" (
    "id" UUID NOT NULL,
    "theme" "DisputeTheme" NOT NULL DEFAULT 'BOOKING',
    "status" "DisputeStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "description" VARCHAR(100) NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "client_type" "ClientType" NOT NULL DEFAULT 'B2B',
    "client_id" VARCHAR(100) NOT NULL DEFAULT '',
    "bookingId" UUID NOT NULL,

    CONSTRAINT "ClientDispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorInvoice" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL DEFAULT '',
    "status" "InvoiceContractor" NOT NULL DEFAULT 'PENDING',
    "file" TEXT,
    "admin_id" UUID NOT NULL,
    "contractor_id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "cancellationId" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractorInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cancellaton" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "reason" VARCHAR(100) NOT NULL DEFAULT '',
    "comment" VARCHAR(100) NOT NULL DEFAULT '',
    "cancelled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Cancellaton_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContractorDispute" ADD CONSTRAINT "ContractorDispute_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorDispute" ADD CONSTRAINT "ContractorDispute_contractorInvoiceId_fkey" FOREIGN KEY ("contractorInvoiceId") REFERENCES "ContractorInvoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorDispute" ADD CONSTRAINT "ContractorDispute_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientDispute" ADD CONSTRAINT "ClientDispute_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorInvoice" ADD CONSTRAINT "ContractorInvoice_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorInvoice" ADD CONSTRAINT "ContractorInvoice_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorInvoice" ADD CONSTRAINT "ContractorInvoice_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorInvoice" ADD CONSTRAINT "ContractorInvoice_cancellationId_fkey" FOREIGN KEY ("cancellationId") REFERENCES "Cancellaton"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cancellaton" ADD CONSTRAINT "Cancellaton_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
