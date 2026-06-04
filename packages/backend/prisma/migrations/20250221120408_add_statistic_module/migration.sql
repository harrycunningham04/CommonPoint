-- CreateEnum
CREATE TYPE "StatisticType" AS ENUM ('BOOKING_RUNNING_LATE', 'BOOKING_RUNNING_ON_TIME');

-- CreateTable
CREATE TABLE "statistic" (
    "id" UUID NOT NULL,
    "contractor_id" UUID NOT NULL,
    "type" "StatisticType" NOT NULL,
    "payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statistic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "statistic_type_contractor_id_created_at_idx" ON "statistic"("type", "contractor_id", "created_at");
