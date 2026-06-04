-- AlterTable
ALTER TABLE "Office" ADD COLUMN     "officeStatus" "ClientStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT false;
