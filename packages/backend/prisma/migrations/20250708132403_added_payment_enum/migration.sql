/*
  Warnings:

  - The `paymentPreferences` column on the `Office` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PaymentPreference" AS ENUM ('INVOICES', 'STRIPE');

-- AlterTable
ALTER TABLE "Office" DROP COLUMN "paymentPreferences",
ADD COLUMN     "paymentPreferences" "PaymentPreference" NOT NULL DEFAULT 'INVOICES';
