/*
  Warnings:

  - Added the required column `stripeId` to the `Coupon` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "stripeId" VARCHAR(100) NOT NULL;
