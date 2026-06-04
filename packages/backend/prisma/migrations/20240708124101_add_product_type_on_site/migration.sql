/*
  Warnings:

  - Added the required column `requires_on_site_contractor` to the `ProductType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductType" ADD COLUMN     "requires_on_site_contractor" BOOLEAN NOT NULL;
