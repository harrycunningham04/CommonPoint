-- AlterTable
ALTER TABLE "contractor" ADD COLUMN     "isFinished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "step" INTEGER NOT NULL DEFAULT 1;
