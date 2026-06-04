-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WidgetType" ADD VALUE 'TRAININGS';
ALTER TYPE "WidgetType" ADD VALUE 'PRODUCTS';

-- AlterTable
ALTER TABLE "B2BClients" ALTER COLUMN "password" SET DEFAULT 'temporary_password';

-- AlterTable
ALTER TABLE "B2CClients" ALTER COLUMN "password" SET DEFAULT 'temporary_password';

-- AlterTable
ALTER TABLE "admin_widget" ADD COLUMN     "position" INTEGER NOT NULL DEFAULT 0;
