-- CreateEnum
CREATE TYPE "EditRequestStatus" AS ENUM ('ACTIVE', 'CLOSED');

-- AlterTable
ALTER TABLE "EditRequest" ADD COLUMN     "status" "EditRequestStatus" NOT NULL DEFAULT 'ACTIVE';
