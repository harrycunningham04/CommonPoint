-- AlterTable
ALTER TABLE "EditRequest" ADD COLUMN     "orderLineId" UUID;

-- AddForeignKey
ALTER TABLE "EditRequest" ADD CONSTRAINT "EditRequest_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "ESoftOrderLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
