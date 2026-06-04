-- AlterTable
ALTER TABLE "ClientDispute" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ContractorDispute" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;
