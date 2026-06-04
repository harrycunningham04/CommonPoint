-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('STRIPE', 'BANK_PAYOUT');

-- AlterTable
ALTER TABLE "contractor" ADD COLUMN     "paymentType" "PaymentType" NOT NULL DEFAULT 'STRIPE';
