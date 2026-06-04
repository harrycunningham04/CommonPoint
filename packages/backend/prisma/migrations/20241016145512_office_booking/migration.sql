-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "officeId" UUID;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;
