-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "b2BClientsId" UUID,
ADD COLUMN     "b2CClientsId" UUID,
ADD COLUMN     "bookingId" UUID,
ADD COLUMN     "contractorId" UUID;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_b2CClientsId_fkey" FOREIGN KEY ("b2CClientsId") REFERENCES "B2CClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_b2BClientsId_fkey" FOREIGN KEY ("b2BClientsId") REFERENCES "B2BClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
