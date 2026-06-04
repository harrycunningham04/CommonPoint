-- CreateEnum
CREATE TYPE "PropertyAccessType" AS ENUM ('APPOINTMENT', 'KEYS');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "alarmCode" VARCHAR(200),
ADD COLUMN     "alarmDetails" VARCHAR(200),
ADD COLUMN     "isAlarm" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keysAddress" VARCHAR(200),
ADD COLUMN     "keysDateTime" TIMESTAMP(3),
ADD COLUMN     "keysDetails" VARCHAR(200),
ADD COLUMN     "propertyAccess" "PropertyAccessType" NOT NULL DEFAULT 'APPOINTMENT',
ADD COLUMN     "propertyDetails" VARCHAR(200),
ADD COLUMN     "trusteeName" VARCHAR(200),
ADD COLUMN     "trusteePhone" VARCHAR(30),
ADD COLUMN     "trusteeRelationship" VARCHAR(200);
