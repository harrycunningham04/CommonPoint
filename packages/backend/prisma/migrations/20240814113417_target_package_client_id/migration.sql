/*
  Warnings:

  - You are about to drop the column `targetId` on the `PackageTargets` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PackageTargets_packageId_idx";

-- DropIndex
DROP INDEX "PackageTargets_targetId_idx";

-- AlterTable
ALTER TABLE "PackageTargets" DROP COLUMN "targetId";
