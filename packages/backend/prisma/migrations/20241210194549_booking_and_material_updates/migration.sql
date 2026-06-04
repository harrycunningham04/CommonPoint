-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('LIKE', 'DISLIKE');

-- AlterTable
ALTER TABLE "EditedMaterial" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "isHeroShoot" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RawMaterial" ADD COLUMN     "fileSize" INTEGER;

-- CreateTable
CREATE TABLE "BookingStageHistory" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "stage" "BookingStage" NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingStageHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawMaterialVote" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "materialId" UUID NOT NULL,
    "voteType" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawMaterialVote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditedMaterialVote" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "materialId" UUID NOT NULL,
    "voteType" "VoteType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditedMaterialVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingStageHistory_bookingId_idx" ON "BookingStageHistory"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "RawMaterialVote_userId_materialId_key" ON "RawMaterialVote"("userId", "materialId");

-- CreateIndex
CREATE UNIQUE INDEX "EditedMaterialVote_userId_materialId_key" ON "EditedMaterialVote"("userId", "materialId");

-- AddForeignKey
ALTER TABLE "BookingStageHistory" ADD CONSTRAINT "BookingStageHistory_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawMaterialVote" ADD CONSTRAINT "RawMaterialVote_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "RawMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditedMaterialVote" ADD CONSTRAINT "EditedMaterialVote_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "EditedMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;
