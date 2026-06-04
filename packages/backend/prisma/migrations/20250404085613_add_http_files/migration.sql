/*
  Warnings:

  - Added the required column `updatedAt` to the `ESoftOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ESoftOrderLine` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ESoftOrder" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ESoftOrderLine" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "ESoftHttpFile" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "orderLineId" UUID NOT NULL,

    CONSTRAINT "ESoftHttpFile_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ESoftHttpFile" ADD CONSTRAINT "ESoftHttpFile_orderLineId_fkey" FOREIGN KEY ("orderLineId") REFERENCES "ESoftOrderLine"("id") ON DELETE CASCADE ON UPDATE CASCADE;
