-- CreateTable
CREATE TABLE "forgot_password_client" (
    "id" UUID NOT NULL,
    "b2cClient_id" UUID,
    "b2bClient_id" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forgot_password_client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTypeBooking" (
    "productTypeId" UUID NOT NULL,
    "bookingId" UUID NOT NULL,

    CONSTRAINT "ProductTypeBooking_pkey" PRIMARY KEY ("productTypeId","bookingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "forgot_password_client_b2cClient_id_key" ON "forgot_password_client"("b2cClient_id");

-- CreateIndex
CREATE UNIQUE INDEX "forgot_password_client_b2bClient_id_key" ON "forgot_password_client"("b2bClient_id");

-- CreateIndex
CREATE INDEX "forgot_password_client_b2cClient_id_idx" ON "forgot_password_client"("b2cClient_id");

-- CreateIndex
CREATE INDEX "forgot_password_client_b2bClient_id_idx" ON "forgot_password_client"("b2bClient_id");

-- AddForeignKey
ALTER TABLE "forgot_password_client" ADD CONSTRAINT "forgot_password_client_b2cClient_id_fkey" FOREIGN KEY ("b2cClient_id") REFERENCES "B2CClients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forgot_password_client" ADD CONSTRAINT "forgot_password_client_b2bClient_id_fkey" FOREIGN KEY ("b2bClient_id") REFERENCES "B2BClients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTypeBooking" ADD CONSTRAINT "ProductTypeBooking_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTypeBooking" ADD CONSTRAINT "ProductTypeBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
