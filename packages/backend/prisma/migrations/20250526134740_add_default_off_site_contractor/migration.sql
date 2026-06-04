-- AlterTable
ALTER TABLE "ProductType" ADD COLUMN     "contractorId" UUID;

-- AddForeignKey
ALTER TABLE "ProductType" ADD CONSTRAINT "ProductType_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
