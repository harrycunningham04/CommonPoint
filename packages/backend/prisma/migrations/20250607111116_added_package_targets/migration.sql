/*
  Warnings:

  - You are about to drop the column `target` on the `PackageTargets` table. All the data in the column will be lost.
  - You are about to drop the column `targetType` on the `PackageTargets` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PackageTargets" DROP COLUMN "target",
DROP COLUMN "targetType",
ADD COLUMN     "b2bClientId" UUID;

-- AddForeignKey
ALTER TABLE "PackageTargets" ADD CONSTRAINT "PackageTargets_b2bClientId_fkey" FOREIGN KEY ("b2bClientId") REFERENCES "B2BClients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
