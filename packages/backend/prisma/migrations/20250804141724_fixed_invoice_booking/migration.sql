/*
  Warnings:

  - You are about to drop the column `bookingGroupId` on the `ClientInvoiceB2B` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClientInvoiceB2B" DROP CONSTRAINT "ClientInvoiceB2B_bookingGroupId_fkey";

-- DropIndex
DROP INDEX "ClientInvoiceB2B_bookingGroupId_key";

-- AlterTable
ALTER TABLE "BookingGroup" ADD COLUMN     "clientInvoiceB2BId" UUID;

-- AlterTable
ALTER TABLE "ClientInvoiceB2B" DROP COLUMN "bookingGroupId";

-- AddForeignKey
ALTER TABLE "BookingGroup" ADD CONSTRAINT "BookingGroup_clientInvoiceB2BId_fkey" FOREIGN KEY ("clientInvoiceB2BId") REFERENCES "ClientInvoiceB2B"("id") ON DELETE CASCADE ON UPDATE CASCADE;
