/*
  Warnings:

  - You are about to drop the column `bookingId` on the `ClientDispute` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ClientDispute" DROP CONSTRAINT "ClientDispute_bookingId_fkey";

-- AlterTable
ALTER TABLE "ClientDispute" DROP COLUMN "bookingId",
ADD COLUMN     "bookingGroupId" UUID;

-- AddForeignKey
ALTER TABLE "ClientDispute" ADD CONSTRAINT "ClientDispute_bookingGroupId_fkey" FOREIGN KEY ("bookingGroupId") REFERENCES "BookingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
