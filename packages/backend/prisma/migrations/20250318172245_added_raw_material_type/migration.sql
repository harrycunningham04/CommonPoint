-- CreateEnum
CREATE TYPE "MaterialRawType" AS ENUM ('RAW', 'RAW_ADDITIONAL');

-- AlterTable
ALTER TABLE "RawMaterial" ADD COLUMN     "rawType" "MaterialRawType" NOT NULL DEFAULT 'RAW';
