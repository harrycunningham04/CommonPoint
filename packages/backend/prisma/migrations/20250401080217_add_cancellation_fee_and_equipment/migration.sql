-- CreateEnum
CREATE TYPE "CancellationFeeType" AS ENUM ('PERCENTAGE', 'POUNDS');

-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('CAMERA', 'LENSE', 'TRIPOD', 'MICROPHONE', 'DRONE', 'CAMERA_360', 'MONOPOD', 'LASER_DISTANCE_MEASURER', 'GIMBLE', 'PHONE');

-- AlterTable
ALTER TABLE "ProductType" ADD COLUMN     "equipment" "EquipmentType"[];

-- CreateTable
CREATE TABLE "CancellationFee" (
    "id" UUID NOT NULL,
    "feeType" "CancellationFeeType" NOT NULL DEFAULT 'PERCENTAGE',
    "value" INTEGER NOT NULL DEFAULT 50,
    "productTypeId" UUID,

    CONSTRAINT "CancellationFee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CancellationFee_productTypeId_key" ON "CancellationFee"("productTypeId");

-- AddForeignKey
ALTER TABLE "CancellationFee" ADD CONSTRAINT "CancellationFee_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
