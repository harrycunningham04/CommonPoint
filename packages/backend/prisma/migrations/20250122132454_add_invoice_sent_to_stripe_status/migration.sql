-- CreateEnum
CREATE TYPE "StripeInvoiceStatus" AS ENUM ('SENT', 'PAID');

-- CreateTable
CREATE TABLE "invoice_sent_to_stripe" (
    "id" UUID NOT NULL,
    "status" "StripeInvoiceStatus" NOT NULL DEFAULT 'SENT',
    "stripe_invoice_id" VARCHAR(100) NOT NULL,
    "client_id" UUID NOT NULL,

    CONSTRAINT "invoice_sent_to_stripe_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invoice_sent_to_stripe" ADD CONSTRAINT "invoice_sent_to_stripe_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "B2CClients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
