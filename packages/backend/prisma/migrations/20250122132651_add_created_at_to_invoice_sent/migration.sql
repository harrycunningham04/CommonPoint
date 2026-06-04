-- AlterTable
ALTER TABLE "invoice_sent_to_stripe" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
