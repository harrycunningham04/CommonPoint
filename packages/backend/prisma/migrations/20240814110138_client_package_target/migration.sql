/*
  Warnings:

  - Added the required column `targetId` to the `PackageTargets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PackageTargets" ADD COLUMN     "targetId" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "PackageTargets_packageId_idx" ON "PackageTargets"("packageId");

-- CreateIndex
CREATE INDEX "PackageTargets_targetId_idx" ON "PackageTargets"("targetId");
