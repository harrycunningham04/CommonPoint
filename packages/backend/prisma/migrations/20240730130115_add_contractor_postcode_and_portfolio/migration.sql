-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "stripeId" SET DEFAULT '';

-- AlterTable
ALTER TABLE "ProductType" ALTER COLUMN "stripeId" SET DEFAULT '';

-- AlterTable
ALTER TABLE "contractor" ADD COLUMN     "portfolio" TEXT,
ADD COLUMN     "postCode" TEXT;
