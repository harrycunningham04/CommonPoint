-- DropIndex
DROP INDEX "admin_widget_adminId_widgetId_key";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "subbrandId" UUID;

-- CreateTable
CREATE TABLE "_SubbrandBookings" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SubbrandBookings_AB_unique" ON "_SubbrandBookings"("A", "B");

-- CreateIndex
CREATE INDEX "_SubbrandBookings_B_index" ON "_SubbrandBookings"("B");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_subbrandId_fkey" FOREIGN KEY ("subbrandId") REFERENCES "Subbrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubbrandBookings" ADD CONSTRAINT "_SubbrandBookings_A_fkey" FOREIGN KEY ("A") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubbrandBookings" ADD CONSTRAINT "_SubbrandBookings_B_fkey" FOREIGN KEY ("B") REFERENCES "Subbrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
