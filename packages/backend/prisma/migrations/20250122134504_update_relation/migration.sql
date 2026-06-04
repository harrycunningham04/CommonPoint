-- DropForeignKey
ALTER TABLE "invoice_sent_to_stripe" DROP CONSTRAINT "invoice_sent_to_stripe_client_id_fkey";

-- AddForeignKey
ALTER TABLE "invoice_sent_to_stripe" ADD CONSTRAINT "invoice_sent_to_stripe_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "B2BClients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
