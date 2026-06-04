/*
  Warnings:

  - Changed the type of `orderId` on the `ESoftOrder` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ESoftOrder" DROP COLUMN "orderId",
ADD COLUMN     "orderId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "ESoftOrderLine" ALTER COLUMN "quantity" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ESoftOrder_orderId_key" ON "ESoftOrder"("orderId");

-- CreateIndex
CREATE INDEX "ESoftOrder_orderId_idx" ON "ESoftOrder"("orderId");
