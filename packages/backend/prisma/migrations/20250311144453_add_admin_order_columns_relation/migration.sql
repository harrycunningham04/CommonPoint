/*
  Warnings:

  - A unique constraint covering the columns `[adminId]` on the table `OrderListColumns` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OrderListColumns" ADD COLUMN     "adminId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "OrderListColumns_adminId_key" ON "OrderListColumns"("adminId");

-- AddForeignKey
ALTER TABLE "OrderListColumns" ADD CONSTRAINT "OrderListColumns_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
