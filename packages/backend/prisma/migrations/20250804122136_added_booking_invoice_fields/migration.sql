/*
  Warnings:

  - A unique constraint covering the columns `[bookingGroupId]` on the table `ClientInvoiceB2B` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId]` on the table `XeroConnection` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "BookingGroup" ADD COLUMN     "invoiced_at" TIMESTAMP(3),
ADD COLUMN     "is_paid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ClientInvoiceB2B" ADD COLUMN     "xero_invoice_id" VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "ClientInvoiceB2B_bookingGroupId_key" ON "ClientInvoiceB2B"("bookingGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "XeroConnection_tenantId_key" ON "XeroConnection"("tenantId");
