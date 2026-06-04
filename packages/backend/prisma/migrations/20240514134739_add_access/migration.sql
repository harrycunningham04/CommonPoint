-- AlterTable
ALTER TABLE "admin" ADD COLUMN     "access" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "address" VARCHAR(50),
ADD COLUMN     "phone" VARCHAR(20);
