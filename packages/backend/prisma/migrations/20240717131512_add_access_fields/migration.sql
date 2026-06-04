-- AlterTable
ALTER TABLE "admin" ADD COLUMN     "couponAccess" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "packageAccess" BOOLEAN NOT NULL DEFAULT false;
