-- AlterTable
ALTER TABLE "Preference" ADD COLUMN     "subbrandId" UUID;

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_subbrandId_fkey" FOREIGN KEY ("subbrandId") REFERENCES "Subbrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
