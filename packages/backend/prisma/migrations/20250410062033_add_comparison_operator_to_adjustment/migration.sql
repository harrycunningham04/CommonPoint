-- CreateEnum
CREATE TYPE "ComparisonOperator" AS ENUM ('GREATER_THAN_OR_EQUAL', 'LESS_THAN_OR_EQUAL');

-- AlterTable
ALTER TABLE "Adjustments" ADD COLUMN     "comparisonOperator" "ComparisonOperator" NOT NULL DEFAULT 'GREATER_THAN_OR_EQUAL';
