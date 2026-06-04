-- AlterTable
ALTER TABLE "ProductType" ALTER COLUMN "productId" DROP NOT NULL,
ALTER COLUMN "requires_on_site_contractor" SET DEFAULT true;
