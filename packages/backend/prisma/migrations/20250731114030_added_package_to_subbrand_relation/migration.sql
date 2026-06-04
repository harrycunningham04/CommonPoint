-- AlterTable
ALTER TABLE "PackageTargets" ADD COLUMN     "subbrandId" UUID;

-- AddForeignKey
ALTER TABLE "PackageTargets" ADD CONSTRAINT "PackageTargets_subbrandId_fkey" FOREIGN KEY ("subbrandId") REFERENCES "Subbrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
