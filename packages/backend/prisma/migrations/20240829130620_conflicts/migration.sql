/*
  Warnings:

  - You are about to drop the `ProductPreference` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "CategoryPreference" AS ENUM ('PHOTOGRAPHY', 'VIDEO', 'FLOORPLAN', 'EDITING', 'EXPORT');

-- AlterEnum
ALTER TYPE "BookingStage" ADD VALUE 'FLOORPLAN_SKETCH_DECLINED';

-- DropForeignKey
ALTER TABLE "ProductPreference" DROP CONSTRAINT "ProductPreference_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ProductPreference" DROP CONSTRAINT "ProductPreference_productId_fkey";

-- AlterTable
ALTER TABLE "B2BClients" ADD COLUMN     "billingAddress" TEXT;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "bookingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "contractorArrivedAt" TIMESTAMP(3),
ADD COLUMN     "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "repeat" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "ProductPreference";

-- CreateTable
CREATE TABLE "Preference" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "clientDescription" TEXT,
    "contractorDescription" TEXT,
    "category" "CategoryPreference" NOT NULL,
    "b2bClientId" UUID,
    "b2cClientId" UUID,

    CONSTRAINT "Preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PreferenceToProduct" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PreferenceToProduct_AB_unique" ON "_PreferenceToProduct"("A", "B");

-- CreateIndex
CREATE INDEX "_PreferenceToProduct_B_index" ON "_PreferenceToProduct"("B");

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_b2bClientId_fkey" FOREIGN KEY ("b2bClientId") REFERENCES "B2BClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_b2cClientId_fkey" FOREIGN KEY ("b2cClientId") REFERENCES "B2CClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferenceToProduct" ADD CONSTRAINT "_PreferenceToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Preference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PreferenceToProduct" ADD CONSTRAINT "_PreferenceToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
