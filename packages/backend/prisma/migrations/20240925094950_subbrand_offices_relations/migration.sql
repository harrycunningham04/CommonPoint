/*
  Warnings:

  - You are about to drop the `_ParentClient` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `subbrandId` on table `Office` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Office" DROP CONSTRAINT "Office_subbrandId_fkey";

-- DropForeignKey
ALTER TABLE "_ParentClient" DROP CONSTRAINT "_ParentClient_A_fkey";

-- DropForeignKey
ALTER TABLE "_ParentClient" DROP CONSTRAINT "_ParentClient_B_fkey";

-- AlterTable
ALTER TABLE "Office" ALTER COLUMN "subbrandId" SET NOT NULL;

-- DropTable
DROP TABLE "_ParentClient";

-- CreateTable
CREATE TABLE "_ParentBrand" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ParentBrand_AB_unique" ON "_ParentBrand"("A", "B");

-- CreateIndex
CREATE INDEX "_ParentBrand_B_index" ON "_ParentBrand"("B");

-- AddForeignKey
ALTER TABLE "Office" ADD CONSTRAINT "Office_subbrandId_fkey" FOREIGN KEY ("subbrandId") REFERENCES "Subbrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentBrand" ADD CONSTRAINT "_ParentBrand_A_fkey" FOREIGN KEY ("A") REFERENCES "B2BClients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParentBrand" ADD CONSTRAINT "_ParentBrand_B_fkey" FOREIGN KEY ("B") REFERENCES "Subbrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
