-- DropForeignKey
ALTER TABLE "Office" DROP CONSTRAINT "Office_preference_id_fkey";

-- DropForeignKey
ALTER TABLE "Office" DROP CONSTRAINT "Office_subbrandId_fkey";

-- AlterTable
ALTER TABLE "Office" ALTER COLUMN "preference_id" DROP NOT NULL,
ALTER COLUMN "subbrandId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_preference_id_fkey" FOREIGN KEY ("preference_id") REFERENCES "Preference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_subbrandId_fkey" FOREIGN KEY ("subbrandId") REFERENCES "Subbrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;
