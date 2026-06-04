/*
  Warnings:

  - You are about to drop the `BookingCGISubmittedMaterial` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[clientPhotoId]` on the table `EditedMaterial` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clientPhotoId` to the `EditedMaterial` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "BookingCGISubmittedMaterial" DROP CONSTRAINT "BookingCGISubmittedMaterial_clientPhotoId_fkey";

-- AlterTable
ALTER TABLE "EditedMaterial" ADD COLUMN     "clientPhotoId" UUID NOT NULL;

-- DropTable
DROP TABLE "BookingCGISubmittedMaterial";

-- CreateIndex
CREATE UNIQUE INDEX "EditedMaterial_clientPhotoId_key" ON "EditedMaterial"("clientPhotoId");

-- AddForeignKey
ALTER TABLE "EditedMaterial" ADD CONSTRAINT "EditedMaterial_clientPhotoId_fkey" FOREIGN KEY ("clientPhotoId") REFERENCES "booking_cgi_client_photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
