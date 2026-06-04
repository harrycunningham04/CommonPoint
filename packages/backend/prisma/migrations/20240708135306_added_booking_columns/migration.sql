-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "BookingListColumns" (
    "id" SERIAL NOT NULL,
    "priority" BOOLEAN NOT NULL DEFAULT true,
    "dateTime" BOOLEAN NOT NULL DEFAULT true,
    "address" BOOLEAN NOT NULL DEFAULT true,
    "contractor" BOOLEAN NOT NULL DEFAULT true,
    "stage" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BookingListColumns_pkey" PRIMARY KEY ("id")
);
