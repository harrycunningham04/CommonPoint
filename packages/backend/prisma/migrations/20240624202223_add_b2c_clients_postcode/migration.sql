/*
  Warnings:

  - Added the required column `postCode` to the `B2CClients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "B2CClients" ADD COLUMN     "postCode" TEXT NOT NULL;
