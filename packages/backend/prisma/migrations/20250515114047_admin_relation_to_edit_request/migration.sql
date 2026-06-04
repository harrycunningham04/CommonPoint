-- DropIndex
DROP INDEX "EditRequestMaterial_editRequestId_key";

-- AlterTable
ALTER TABLE "EditRequest" ADD COLUMN     "adminId" UUID,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "EditRequest" ADD CONSTRAINT "EditRequest_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
