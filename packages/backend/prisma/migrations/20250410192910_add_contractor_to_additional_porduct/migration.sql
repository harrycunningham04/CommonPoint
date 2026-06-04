-- AlterTable
ALTER TABLE "AdditionalProductType" ADD COLUMN     "contractorId" UUID;

-- AddForeignKey
ALTER TABLE "AdditionalProductType" ADD CONSTRAINT "AdditionalProductType_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
