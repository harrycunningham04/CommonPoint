-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('NEW', 'REGULAR', 'PRIORITIZED');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "B2CClient" (
    "id" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "mark" "ClientStatus" NOT NULL DEFAULT 'NEW',

    CONSTRAINT "B2CClient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "B2BClient" (
    "id" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "officeStatus" "ClientStatus" NOT NULL DEFAULT 'NEW',
    "status" "Status" NOT NULL DEFAULT 'INACTIVE',

    CONSTRAINT "B2BClient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "B2CClient_email_key" ON "B2CClient"("email");

-- CreateIndex
CREATE UNIQUE INDEX "B2BClient_email_key" ON "B2BClient"("email");
