/*
  Warnings:

  - You are about to drop the column `target` on the `Coupon` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Coupon" DROP COLUMN "target";

-- CreateTable
CREATE TABLE "CouponTarget" (
    "id" UUID NOT NULL,
    "couponId" UUID NOT NULL,
    "targetId" UUID NOT NULL,
    "targetType" "Target" NOT NULL,
    "target" TEXT NOT NULL,

    CONSTRAINT "CouponTarget_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CouponTarget" ADD CONSTRAINT "CouponTarget_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
