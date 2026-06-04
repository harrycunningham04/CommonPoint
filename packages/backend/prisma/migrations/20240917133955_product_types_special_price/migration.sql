/*
  Warnings:

  - You are about to drop the `ProductSpecialPrice` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `productId` on table `ProductType` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ProductSpecialPrice" DROP CONSTRAINT "ProductSpecialPrice_b2bClientId_fkey";

-- DropForeignKey
ALTER TABLE "ProductSpecialPrice" DROP CONSTRAINT "ProductSpecialPrice_b2cClientId_fkey";

-- DropForeignKey
ALTER TABLE "ProductSpecialPrice" DROP CONSTRAINT "ProductSpecialPrice_productId_fkey";

-- AlterTable
ALTER TABLE "ProductType" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "productId" SET NOT NULL;

-- DropTable
DROP TABLE "ProductSpecialPrice";

-- CreateTable
CREATE TABLE "ProductTypeSpecialPrice" (
    "id" UUID NOT NULL,
    "productTypeId" UUID NOT NULL,
    "clientB2BId" UUID,
    "clientB2CId" UUID,
    "price" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductTypeSpecialPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductTypeSpecialPrice_productTypeId_clientB2BId_key" ON "ProductTypeSpecialPrice"("productTypeId", "clientB2BId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTypeSpecialPrice_productTypeId_clientB2CId_key" ON "ProductTypeSpecialPrice"("productTypeId", "clientB2CId");

-- AddForeignKey
ALTER TABLE "ProductTypeSpecialPrice" ADD CONSTRAINT "ProductTypeSpecialPrice_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTypeSpecialPrice" ADD CONSTRAINT "ProductTypeSpecialPrice_clientB2BId_fkey" FOREIGN KEY ("clientB2BId") REFERENCES "B2BClients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTypeSpecialPrice" ADD CONSTRAINT "ProductTypeSpecialPrice_clientB2CId_fkey" FOREIGN KEY ("clientB2CId") REFERENCES "B2CClients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
