-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'AMOUNT');

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'PERCENTAGE';
