/*
  Warnings:

  - You are about to drop the column `notification_preferences` on the `Worker` table. All the data in the column will be lost.
  - You are about to drop the column `office_id` on the `Worker` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Worker" DROP CONSTRAINT "Worker_office_id_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "coupon" VARCHAR(30);

-- AlterTable
ALTER TABLE "NotificationUserPreferences" ADD COLUMN     "workerId" UUID;

-- AlterTable
ALTER TABLE "Office" ADD COLUMN     "address" VARCHAR(200) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "PackageTargets" ADD COLUMN     "officeId" UUID;

-- AlterTable
ALTER TABLE "Worker" DROP COLUMN "notification_preferences",
DROP COLUMN "office_id",
ADD COLUMN     "password" VARCHAR(255) NOT NULL DEFAULT 'temporary_password';

-- CreateTable
CREATE TABLE "WorkerOnOffice" (
    "worker_id" UUID NOT NULL,
    "office_id" UUID NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkerOnOffice_pkey" PRIMARY KEY ("worker_id","office_id")
);

-- AddForeignKey
ALTER TABLE "WorkerOnOffice" ADD CONSTRAINT "WorkerOnOffice_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerOnOffice" ADD CONSTRAINT "WorkerOnOffice_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationUserPreferences" ADD CONSTRAINT "NotificationUserPreferences_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageTargets" ADD CONSTRAINT "PackageTargets_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "Office"("id") ON DELETE SET NULL ON UPDATE CASCADE;
