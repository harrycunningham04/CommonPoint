-- CreateEnum
CREATE TYPE "ESoftOrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "ESoftOrder" ADD COLUMN     "status" "ESoftOrderStatus" NOT NULL DEFAULT 'PENDING';
