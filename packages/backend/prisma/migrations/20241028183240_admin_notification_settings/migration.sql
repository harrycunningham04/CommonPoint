-- AlterTable
ALTER TABLE "admin" ADD COLUMN     "bookingsNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "clientNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contractorNotifications" BOOLEAN NOT NULL DEFAULT false;
