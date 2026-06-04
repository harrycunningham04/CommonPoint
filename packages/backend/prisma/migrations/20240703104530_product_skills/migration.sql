/*
  Warnings:

  - You are about to drop the column `skills` on the `ProductType` table. All the data in the column will be lost.
  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_productTypeId_fkey";

-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_skillId_fkey";

-- AlterTable
ALTER TABLE "ProductType" DROP COLUMN "skills";

-- DropTable
DROP TABLE "product";

-- CreateTable
CREATE TABLE "Product" (
    "id" UUID NOT NULL,
    "productTypeId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "requiresOnSiteContractor" BOOLEAN NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTypeSkills" (
    "productTypeId" UUID NOT NULL,
    "skillId" UUID NOT NULL,

    CONSTRAINT "ProductTypeSkills_pkey" PRIMARY KEY ("productTypeId","skillId")
);

-- CreateTable
CREATE TABLE "ProductSkills" (
    "productId" UUID NOT NULL,
    "skillId" UUID NOT NULL,

    CONSTRAINT "ProductSkills_pkey" PRIMARY KEY ("productId","skillId")
);

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTypeSkills" ADD CONSTRAINT "ProductTypeSkills_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTypeSkills" ADD CONSTRAINT "ProductTypeSkills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSkills" ADD CONSTRAINT "ProductSkills_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductSkills" ADD CONSTRAINT "ProductSkills_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
