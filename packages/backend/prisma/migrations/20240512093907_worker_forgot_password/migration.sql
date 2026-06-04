/*
  Warnings:

  - Made the column `office_worker_id` on table `forgot_password` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "forgot_password" ALTER COLUMN "office_worker_id" SET NOT NULL;
