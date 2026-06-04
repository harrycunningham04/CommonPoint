/*
  Warnings:

  - You are about to drop the column `b2BClientsId` on the `BookingGroup` table. All the data in the column will be lost.
  - You are about to drop the column `b2CClientsId` on the `BookingGroup` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `BookingGroup` table. All the data in the column will be lost.
  - You are about to drop the column `officeId` on the `BookingGroup` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "BookingGroup" DROP CONSTRAINT "BookingGroup_b2BClientsId_fkey";

-- DropForeignKey
ALTER TABLE "BookingGroup" DROP CONSTRAINT "BookingGroup_b2CClientsId_fkey";

-- DropForeignKey
ALTER TABLE "BookingGroup" DROP CONSTRAINT "BookingGroup_officeId_fkey";

-- AlterTable
ALTER TABLE "BookingGroup" DROP COLUMN "b2BClientsId",
DROP COLUMN "b2CClientsId",
DROP COLUMN "createdAt",
DROP COLUMN "officeId",
ADD COLUMN     "b2b_clients_id" UUID,
ADD COLUMN     "b2c_clients_id" UUID,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "office_id" UUID,
ADD COLUMN     "sum_of_prices" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "BookingGroup" ADD CONSTRAINT "BookingGroup_b2b_clients_id_fkey" FOREIGN KEY ("b2b_clients_id") REFERENCES "B2BClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingGroup" ADD CONSTRAINT "BookingGroup_b2c_clients_id_fkey" FOREIGN KEY ("b2c_clients_id") REFERENCES "B2CClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingGroup" ADD CONSTRAINT "BookingGroup_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;
