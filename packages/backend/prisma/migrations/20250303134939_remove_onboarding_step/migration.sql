/*
  Warnings:

  - You are about to drop the column `isFinished` on the `contractor` table. All the data in the column will be lost.
  - You are about to drop the column `step` on the `contractor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "contractor" DROP COLUMN "isFinished",
DROP COLUMN "step";
