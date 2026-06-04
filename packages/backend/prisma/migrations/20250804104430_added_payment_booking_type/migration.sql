-- DropIndex
DROP INDEX "XeroConnection_tenantId_key";

-- AlterTable
ALTER TABLE "BookingGroup" ADD COLUMN     "payment_preference" "PaymentPreference" NOT NULL DEFAULT 'STRIPE';
