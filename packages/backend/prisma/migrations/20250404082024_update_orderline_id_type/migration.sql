/*
  Warnings:

  - Changed the type of `orderLineId` on the `ESoftOrderLine` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ESoftOrderLine" DROP COLUMN "orderLineId",
ADD COLUMN     "orderLineId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ESoftOrderLine_orderLineId_key" ON "ESoftOrderLine"("orderLineId");
