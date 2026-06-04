/*
  Warnings:

  - The `contentType` column on the `EditedMaterial` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `contentType` column on the `RawMaterial` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MaterialTypeContent" AS ENUM ('PHOTOS', 'VIDEOS', 'SKETCHES', 'FLOORPLANS', 'REFERENCES');

-- AlterTable
ALTER TABLE "EditedMaterial" DROP COLUMN "contentType",
ADD COLUMN     "contentType" "MaterialTypeContent" NOT NULL DEFAULT 'PHOTOS';

-- AlterTable
ALTER TABLE "RawMaterial" DROP COLUMN "contentType",
ADD COLUMN     "contentType" "MaterialTypeContent" NOT NULL DEFAULT 'PHOTOS';

-- CreateTable
CREATE TABLE "OrderListColumns" (
    "id" SERIAL NOT NULL,
    "priority" BOOLEAN NOT NULL DEFAULT true,
    "dateTime" BOOLEAN NOT NULL DEFAULT true,
    "contractor" BOOLEAN NOT NULL DEFAULT true,
    "stage" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OrderListColumns_pkey" PRIMARY KEY ("id")
);
