-- CreateEnum
CREATE TYPE "CouponType" AS ENUM ('VOLUME_OF_CASH', 'VOLUME_OF_ORDERS', 'SINGLE_USE');

-- CreateEnum
CREATE TYPE "Target" AS ENUM ('PRODUCT', 'PRODUCT_VARIANT', 'CLIENT_B2B', 'CLIENT_B2C', 'REGION', 'OFFICE_WORKER', 'SUBBRAND', 'PACKAGE');

-- CreateTable
CREATE TABLE "Coupon" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "discount" INTEGER NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "owner_id" UUID NOT NULL,
    "type" "CouponType" NOT NULL,
    "target" "Target" NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
