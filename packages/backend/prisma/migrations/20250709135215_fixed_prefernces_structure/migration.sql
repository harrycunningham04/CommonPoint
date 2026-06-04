/*
  Warnings:

  - You are about to drop the column `preference_id` on the `Office` table. All the data in the column will be lost.
  - You are about to drop the column `b2bClientId` on the `Preference` table. All the data in the column will be lost.
  - You are about to drop the column `b2cClientId` on the `Preference` table. All the data in the column will be lost.
  - You are about to drop the column `clientDescription` on the `Preference` table. All the data in the column will be lost.
  - You are about to drop the column `contractorDescription` on the `Preference` table. All the data in the column will be lost.
  - You are about to drop the column `officeId` on the `Preference` table. All the data in the column will be lost.
  - You are about to drop the column `subbrandId` on the `Preference` table. All the data in the column will be lost.
  - You are about to drop the `_PreferenceToProduct` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `Preference` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Office" DROP CONSTRAINT "Office_preference_id_fkey";

-- DropForeignKey
ALTER TABLE "Preference" DROP CONSTRAINT "Preference_b2bClientId_fkey";

-- DropForeignKey
ALTER TABLE "Preference" DROP CONSTRAINT "Preference_b2cClientId_fkey";

-- DropForeignKey
ALTER TABLE "Preference" DROP CONSTRAINT "Preference_officeId_fkey";

-- DropForeignKey
ALTER TABLE "Preference" DROP CONSTRAINT "Preference_subbrandId_fkey";

-- DropForeignKey
ALTER TABLE "_PreferenceToProduct" DROP CONSTRAINT "_PreferenceToProduct_A_fkey";

-- DropForeignKey
ALTER TABLE "_PreferenceToProduct" DROP CONSTRAINT "_PreferenceToProduct_B_fkey";

-- AlterTable
ALTER TABLE "Office" DROP COLUMN "preference_id";

-- AlterTable
ALTER TABLE "Preference" DROP COLUMN "b2bClientId",
DROP COLUMN "b2cClientId",
DROP COLUMN "clientDescription",
DROP COLUMN "contractorDescription",
DROP COLUMN "officeId",
DROP COLUMN "subbrandId",
ADD COLUMN     "description" TEXT NOT NULL;

-- DropTable
DROP TABLE "_PreferenceToProduct";

-- CreateTable
CREATE TABLE "ClientB2BPreference" (
    "id" UUID NOT NULL,
    "b2bClientId" UUID NOT NULL,
    "preferenceId" UUID NOT NULL,

    CONSTRAINT "ClientB2BPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientB2CPreference" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "preferenceId" UUID NOT NULL,

    CONSTRAINT "ClientB2CPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfficePreference" (
    "id" UUID NOT NULL,
    "officeId" UUID NOT NULL,
    "preferenceId" UUID NOT NULL,

    CONSTRAINT "OfficePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerPreference" (
    "id" UUID NOT NULL,
    "workerId" UUID NOT NULL,
    "preferenceId" UUID NOT NULL,

    CONSTRAINT "WorkerPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookingPreferenceTable" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "preferenceId" UUID NOT NULL,

    CONSTRAINT "BookingPreferenceTable_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ClientB2BPreference" ADD CONSTRAINT "ClientB2BPreference_b2bClientId_fkey" FOREIGN KEY ("b2bClientId") REFERENCES "B2BClients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientB2BPreference" ADD CONSTRAINT "ClientB2BPreference_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "Preference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientB2CPreference" ADD CONSTRAINT "ClientB2CPreference_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "B2CClients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientB2CPreference" ADD CONSTRAINT "ClientB2CPreference_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "Preference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficePreference" ADD CONSTRAINT "OfficePreference_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficePreference" ADD CONSTRAINT "OfficePreference_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "Preference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerPreference" ADD CONSTRAINT "WorkerPreference_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerPreference" ADD CONSTRAINT "WorkerPreference_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "Preference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingPreferenceTable" ADD CONSTRAINT "BookingPreferenceTable_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingPreferenceTable" ADD CONSTRAINT "BookingPreferenceTable_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "Preference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
