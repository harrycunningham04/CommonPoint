-- CreateEnum
CREATE TYPE "ESoftProductTypes" AS ENUM ('PHOTO', 'VIDEO');

-- CreateTable
CREATE TABLE "ESoftOrder" (
    "id" UUID NOT NULL,
    "orderId" TEXT NOT NULL,
    "reference" UUID NOT NULL,

    CONSTRAINT "ESoftOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ESoftOrderLine" (
    "id" UUID NOT NULL,
    "type" "ESoftProductTypes" NOT NULL,
    "orderLineId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "externalId" TEXT,
    "productName" TEXT,
    "autoMarkBatchReady" BOOLEAN,
    "orderId" UUID NOT NULL,

    CONSTRAINT "ESoftOrderLine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ESoftOrder_orderId_key" ON "ESoftOrder"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ESoftOrder_reference_key" ON "ESoftOrder"("reference");

-- CreateIndex
CREATE INDEX "ESoftOrder_orderId_idx" ON "ESoftOrder"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "ESoftOrderLine_orderLineId_key" ON "ESoftOrderLine"("orderLineId");

-- CreateIndex
CREATE INDEX "ESoftOrderLine_orderId_idx" ON "ESoftOrderLine"("orderId");

-- AddForeignKey
ALTER TABLE "ESoftOrderLine" ADD CONSTRAINT "ESoftOrderLine_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "ESoftOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
