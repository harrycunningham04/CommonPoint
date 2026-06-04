-- DropForeignKey
ALTER TABLE "Office" DROP CONSTRAINT "Office_b2BClientsId_fkey";

-- AlterTable
ALTER TABLE "Office" ALTER COLUMN "b2BClientsId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_b2BClientsId_fkey" FOREIGN KEY ("b2BClientsId") REFERENCES "B2BClients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
