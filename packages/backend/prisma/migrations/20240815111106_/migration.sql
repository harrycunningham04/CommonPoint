/*
  Warnings:

  - You are about to drop the column `productPreferences` on the `B2BClients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "B2BClients" DROP COLUMN "productPreferences";

-- CreateTable
CREATE TABLE "ProductPreference" (
    "id" UUID NOT NULL,
    "clientId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "preference" TEXT NOT NULL,

    CONSTRAINT "ProductPreference_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductPreference" ADD CONSTRAINT "ProductPreference_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "B2BClients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPreference" ADD CONSTRAINT "ProductPreference_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
