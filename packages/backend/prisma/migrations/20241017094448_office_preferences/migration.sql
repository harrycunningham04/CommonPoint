-- AlterTable
ALTER TABLE "Preference" ADD COLUMN     "officeId" UUID;

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;
