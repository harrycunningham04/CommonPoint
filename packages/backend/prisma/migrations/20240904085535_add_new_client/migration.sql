/*
  Warnings:

  - Added the required column `password` to the `B2BClients` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `B2CClients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "B2BClients" ADD COLUMN     "password" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "B2CClients" ADD COLUMN     "password" VARCHAR(255) NOT NULL;
