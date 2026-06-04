-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "ProductSpecialPrice" (
    "id" UUID NOT NULL,
    "b2bClientId" UUID,
    "b2cClientId" UUID,
    "productId" UUID NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductSpecialPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductSpecialPrice_b2bClientId_productId_key" ON "ProductSpecialPrice"("b2bClientId", "productId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductSpecialPrice_b2cClientId_productId_key" ON "ProductSpecialPrice"("b2cClientId", "productId");

-- AddForeignKey
ALTER TABLE "ProductSpecialPrice" ADD CONSTRAINT "ProductSpecialPrice_b2bClientId_fkey" FOREIGN KEY ("b2bClientId") REFERENCES "B2BClients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecialPrice" ADD CONSTRAINT "ProductSpecialPrice_b2cClientId_fkey" FOREIGN KEY ("b2cClientId") REFERENCES "B2CClients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSpecialPrice" ADD CONSTRAINT "ProductSpecialPrice_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
