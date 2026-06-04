-- AlterTable
ALTER TABLE "ProductTypeSpecialPrice" ADD COLUMN     "subbrandId" UUID;

-- AddForeignKey
ALTER TABLE "ProductTypeSpecialPrice" ADD CONSTRAINT "ProductTypeSpecialPrice_subbrandId_fkey" FOREIGN KEY ("subbrandId") REFERENCES "Subbrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
