/*
  Warnings:

  - You are about to drop the column `isAvailabilitySet` on the `contractor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contractor" DROP COLUMN "isAvailabilitySet",
ADD COLUMN     "is_availability_set" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_profile_created" BOOLEAN NOT NULL DEFAULT false;
