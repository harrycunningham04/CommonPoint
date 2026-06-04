-- CreateEnum
CREATE TYPE "auth" AS ENUM ('CREDENTIALS', 'GOOGLE');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SALES', 'CONTENT_CREATION', 'BOOKINGS', 'OPERATIONS');

-- CreateEnum
CREATE TYPE "NotificationPreferences" AS ENUM ('CONTENT', 'BOOKING', 'CONTRACTOR', 'BOOKING_REPORT', 'INVOICES', 'KEYS', 'REPORTS', 'OFFICE_ADDED');

-- CreateTable
CREATE TABLE "office_worker" (
    "id" UUID NOT NULL,
    "email" VARCHAR(55) NOT NULL,
    "password" VARCHAR(255),
    "avatar" TEXT,
    "name" VARCHAR(50),
    "surname" VARCHAR(50),
    "role" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "direct_line" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notification" "NotificationPreferences" NOT NULL,

    CONSTRAINT "office_worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin" (
    "id" UUID NOT NULL,
    "email" VARCHAR(55) NOT NULL,
    "password" VARCHAR(255),
    "avatar" TEXT,
    "name" VARCHAR(50) NOT NULL,
    "surname" VARCHAR(50) NOT NULL,
    "role" "AdminRole" NOT NULL,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_confirmation" (
    "id" SERIAL NOT NULL,
    "token" UUID NOT NULL,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "office_worker_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_confirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forgot_password" (
    "id" UUID NOT NULL,
    "office_worker_id" UUID NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forgot_password_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_email" (
    "id" SERIAL NOT NULL,
    "office_worker_id" UUID NOT NULL,
    "oldEmailCode" TEXT NOT NULL,
    "newEmailCode" TEXT NOT NULL,
    "newEmail" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "change_email_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "office_worker_email_key" ON "office_worker"("email");

-- CreateIndex
CREATE INDEX "office_worker_email_idx" ON "office_worker"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_email_key" ON "admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "email_confirmation_token_key" ON "email_confirmation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "email_confirmation_office_worker_id_key" ON "email_confirmation"("office_worker_id");

-- CreateIndex
CREATE INDEX "email_confirmation_token_office_worker_id_idx" ON "email_confirmation"("token", "office_worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "forgot_password_office_worker_id_key" ON "forgot_password"("office_worker_id");

-- CreateIndex
CREATE INDEX "forgot_password_office_worker_id_idx" ON "forgot_password"("office_worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "change_email_office_worker_id_key" ON "change_email"("office_worker_id");

-- CreateIndex
CREATE INDEX "change_email_office_worker_id_idx" ON "change_email"("office_worker_id");

-- AddForeignKey
ALTER TABLE "email_confirmation" ADD CONSTRAINT "email_confirmation_office_worker_id_fkey" FOREIGN KEY ("office_worker_id") REFERENCES "office_worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "forgot_password" ADD CONSTRAINT "forgot_password_office_worker_id_fkey" FOREIGN KEY ("office_worker_id") REFERENCES "office_worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_email" ADD CONSTRAINT "change_email_office_worker_id_fkey" FOREIGN KEY ("office_worker_id") REFERENCES "office_worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;
