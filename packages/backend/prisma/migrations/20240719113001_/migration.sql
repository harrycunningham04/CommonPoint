/*
  Warnings:

  - You are about to drop the column `couponAccess` on the `admin` table. All the data in the column will be lost.
  - You are about to drop the column `packageAccess` on the `admin` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admin" DROP COLUMN "couponAccess",
DROP COLUMN "packageAccess";
