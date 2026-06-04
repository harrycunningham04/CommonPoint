/*
  Warnings:

  - You are about to drop the `WorkerPreference` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "WorkerPreference" DROP CONSTRAINT "WorkerPreference_preferenceId_fkey";

-- DropForeignKey
ALTER TABLE "WorkerPreference" DROP CONSTRAINT "WorkerPreference_workerId_fkey";

-- DropTable
DROP TABLE "WorkerPreference";
