/*
  Warnings:

  - A unique constraint covering the columns `[stripe_invoice_id,client_id]` on the table `invoice_sent_to_stripe` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "invoice_sent_to_stripe_stripe_invoice_id_client_id_key" ON "invoice_sent_to_stripe"("stripe_invoice_id", "client_id");
