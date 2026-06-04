/*
  Warnings:

  - You are about to drop the column `propertyType` on the `Office` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Office" DROP COLUMN "propertyType",
ADD COLUMN     "propertyTypes" "PropertyType"[];
