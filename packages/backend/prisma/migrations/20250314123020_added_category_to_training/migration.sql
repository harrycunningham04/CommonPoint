/*
  Warnings:

  - Changed the type of `category` on the `training` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TrainingCategory" AS ENUM ('PHOTOGRAPHY', 'VIDEO', 'FLOORPLAN', 'VIRTUAL_STAGING', 'EPC', 'FIRERISK_ASSESMENT');

-- AlterTable
ALTER TABLE "training" DROP COLUMN "category",
ADD COLUMN     "category" "TrainingCategory" NOT NULL;
