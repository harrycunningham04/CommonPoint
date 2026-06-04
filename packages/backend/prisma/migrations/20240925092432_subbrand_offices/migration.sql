/*
  Warnings:

  - You are about to drop the `_Subbrands` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Subbrands" DROP CONSTRAINT "_Subbrands_A_fkey";

-- DropForeignKey
ALTER TABLE "_Subbrands" DROP CONSTRAINT "_Subbrands_B_fkey";

-- AlterTable
ALTER TABLE "Office" ADD COLUMN     "subbrandId" UUID;

-- DropTable
DROP TABLE "_Subbrands";

-- CreateTable
CREATE TABLE "_ParentClient" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ParentClient_AB_unique" ON "_ParentClient"("A", "B");

-- CreateIndex
CREATE INDEX "_ParentClient_B_index" ON "_ParentClient"("B");

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_subbrandId_fkey" FOREIGN KEY ("subbrandId") REFERENCES "Subbrand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentClient" ADD CONSTRAINT "_ParentClient_A_fkey" FOREIGN KEY ("A") REFERENCES "B2BClients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentClient" ADD CONSTRAINT "_ParentClient_B_fkey" FOREIGN KEY ("B") REFERENCES "Subbrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
