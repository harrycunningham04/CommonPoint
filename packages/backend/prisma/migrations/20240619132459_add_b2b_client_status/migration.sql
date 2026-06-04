/*
  Warnings:

  - You are about to drop the `B2BClient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `B2CClient` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "B2BClient";

-- DropTable
DROP TABLE "B2CClient";

-- DropEnum
DROP TYPE "Status";

-- CreateTable
CREATE TABLE "B2CClients" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "mark" "ClientStatus" NOT NULL DEFAULT 'NEW',

    CONSTRAINT "B2CClients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "B2BClients" (
    "id" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "officeStatus" "ClientStatus" NOT NULL DEFAULT 'NEW',
    "status" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "B2BClients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "B2CClients_email_key" ON "B2CClients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "B2BClients_email_key" ON "B2BClients"("email");
