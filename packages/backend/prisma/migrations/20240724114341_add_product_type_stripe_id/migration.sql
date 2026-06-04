/*
  Warnings:

  - You are about to drop the column `stripeId` on the `Product` table. All the data in the column will be lost.
  - Added the required column `stripeId` to the `ProductType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "stripeId";

-- AlterTable
ALTER TABLE "ProductType" ADD COLUMN     "stripeId" VARCHAR(100) NOT NULL;
