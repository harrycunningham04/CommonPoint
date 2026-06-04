-- AlterTable
ALTER TABLE "admin_widget" ADD COLUMN     "defaultIsActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "defaultPosition" INTEGER NOT NULL DEFAULT 0;
