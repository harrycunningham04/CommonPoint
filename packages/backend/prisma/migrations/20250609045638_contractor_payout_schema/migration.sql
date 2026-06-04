-- CreateEnum
CREATE TYPE "ContractorPayoutStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "ContractorPayout" (
    "id" UUID NOT NULL,
    "contractorId" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "transfer_id" TEXT NOT NULL,
    "payout_id" TEXT,
    "status" "ContractorPayoutStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractorPayout_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContractorPayout" ADD CONSTRAINT "ContractorPayout_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
