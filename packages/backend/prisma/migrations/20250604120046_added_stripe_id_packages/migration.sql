-- AlterEnum
ALTER TYPE "ESoftOrderStatus" ADD VALUE 'CREATED';

-- AlterTable
ALTER TABLE "Package" ADD COLUMN     "stripeId" VARCHAR(100) NOT NULL DEFAULT '';
