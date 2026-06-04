/*
  Warnings:

  - You are about to drop the column `office_worker_id` on the `change_email` table. All the data in the column will be lost.
  - You are about to drop the `email_confirmation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `forgot_password` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `office_worker` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[contractor_id]` on the table `change_email` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contractor_id` to the `change_email` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContractorSkillNama" AS ENUM ('VIDEO', 'PHOTO', 'DRONE', 'FLOORPLAN', 'EPC', 'FIRERISK_ASSESMENT', 'CGI', 'VIRTUAL_TOUR', 'HEADSHOT', 'LEASE_PLAN');

-- CreateEnum
CREATE TYPE "ContractorTransportation" AS ENUM ('BICYCLE', 'MOTOBIKE', 'CAR', 'PUBLIC_TRANSPORTATION');

-- DropForeignKey
ALTER TABLE "change_email" DROP CONSTRAINT "change_email_office_worker_id_fkey";

-- DropForeignKey
ALTER TABLE "email_confirmation" DROP CONSTRAINT "email_confirmation_office_worker_id_fkey";

-- DropForeignKey
ALTER TABLE "forgot_password" DROP CONSTRAINT "forgot_password_office_worker_id_fkey";

-- DropIndex
DROP INDEX "change_email_office_worker_id_idx";

-- DropIndex
DROP INDEX "change_email_office_worker_id_key";

-- AlterTable
ALTER TABLE "change_email" DROP COLUMN "office_worker_id",
ADD COLUMN     "contractor_id" UUID NOT NULL;

-- DropTable
DROP TABLE "email_confirmation";

-- DropTable
DROP TABLE "forgot_password";

-- DropTable
DROP TABLE "office_worker";

-- CreateTable
CREATE TABLE "contractor" (
    "id" UUID NOT NULL,
    "email" VARCHAR(55) NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "radius" INTEGER NOT NULL DEFAULT 4,
    "priority" BOOLEAN NOT NULL DEFAULT false,
    "name" VARCHAR(50) NOT NULL,
    "surname" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(20),
    "password" VARCHAR(255),
    "avatar" TEXT,
    "address" VARCHAR(50),
    "mark" INTEGER,
    "transportacion" "ContractorTransportation" NOT NULL DEFAULT 'PUBLIC_TRANSPORTATION',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skills" (
    "id" UUID NOT NULL,
    "name" "ContractorSkillNama" NOT NULL,
    "icon" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forgot_password_contractor" (
    "id" UUID NOT NULL,
    "contractor_id" UUID NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forgot_password_contractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContractorToSkills" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "contractor_email_key" ON "contractor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "forgot_password_contractor_contractor_id_key" ON "forgot_password_contractor"("contractor_id");

-- CreateIndex
CREATE INDEX "forgot_password_contractor_contractor_id_idx" ON "forgot_password_contractor"("contractor_id");

-- CreateIndex
CREATE UNIQUE INDEX "_ContractorToSkills_AB_unique" ON "_ContractorToSkills"("A", "B");

-- CreateIndex
CREATE INDEX "_ContractorToSkills_B_index" ON "_ContractorToSkills"("B");

-- CreateIndex
CREATE UNIQUE INDEX "change_email_contractor_id_key" ON "change_email"("contractor_id");

-- CreateIndex
CREATE INDEX "change_email_contractor_id_idx" ON "change_email"("contractor_id");

-- AddForeignKey
ALTER TABLE "forgot_password_contractor" ADD CONSTRAINT "forgot_password_contractor_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_email" ADD CONSTRAINT "change_email_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContractorToSkills" ADD CONSTRAINT "_ContractorToSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContractorToSkills" ADD CONSTRAINT "_ContractorToSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "Skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
