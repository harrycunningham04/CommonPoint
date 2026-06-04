/*
  Warnings:

  - A unique constraint covering the columns `[clientId,productId]` on the table `ProductPreference` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProductPreference" DROP CONSTRAINT "ProductPreference_clientId_fkey";

-- DropForeignKey
ALTER TABLE "ProductPreference" DROP CONSTRAINT "ProductPreference_productId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "ProductPreference_clientId_productId_key" ON "ProductPreference"("clientId", "productId");

-- AddForeignKey
ALTER TABLE "ProductPreference" ADD CONSTRAINT "ProductPreference_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "B2BClients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPreference" ADD CONSTRAINT "ProductPreference_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
