/*
  Warnings:

  - You are about to alter the column `name` on the `Office` table. The data in that column could be lost. The data in that column will be cast from `VarChar(150)` to `VarChar(100)`.
  - Added the required column `numberOfWorkers` to the `Office` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyType` to the `Office` table without a default value. This is not possible if the table is not empty.
  - Added the required column `surname` to the `Office` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Office` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContractorDisputeCategory" AS ENUM ('CAPTURE_ISSUE', 'JOB_DISCREPANCY', 'INVOICE_DISPUTE');

-- CreateEnum
CREATE TYPE "ClientDisputeCategory" AS ENUM ('CLIENT_INVOICE', 'QUALITY_CONCERN', 'BOOKING_ISSUE');

-- AlterTable
ALTER TABLE "ClientDispute" ADD COLUMN     "category" "ClientDisputeCategory" NOT NULL DEFAULT 'BOOKING_ISSUE';

-- AlterTable
ALTER TABLE "ContractorDispute" ADD COLUMN     "category" "ContractorDisputeCategory" NOT NULL DEFAULT 'CAPTURE_ISSUE';

-- AlterTable
ALTER TABLE "Office" ADD COLUMN     "numberOfWorkers" INTEGER NOT NULL,
ADD COLUMN     "propertyType" "PropertyType" NOT NULL,
ADD COLUMN     "surname" VARCHAR(100) NOT NULL,
ADD COLUMN     "title" VARCHAR(150) NOT NULL,
ALTER COLUMN "name" DROP DEFAULT,
ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);
