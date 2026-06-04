/*
  Warnings:

  - The values [FLOORPLANS,EPC,LEASE_PLAN] on the enum `MaterialTypeContent` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "MaterialTypeContent_new" AS ENUM ('PHOTOS', 'VIDEOS', 'SKETCHES', 'REFERENCES', 'AUDIOS', 'FIRE_RISK_ASSESSMENT');
ALTER TABLE "EditRequestMaterial" ALTER COLUMN "contentType" DROP DEFAULT;
ALTER TABLE "RawMaterial" ALTER COLUMN "contentType" DROP DEFAULT;
ALTER TABLE "EditedMaterial" ALTER COLUMN "contentType" DROP DEFAULT;
ALTER TABLE "RawMaterial" ALTER COLUMN "contentType" TYPE "MaterialTypeContent_new" USING ("contentType"::text::"MaterialTypeContent_new");
ALTER TABLE "EditedMaterial" ALTER COLUMN "contentType" TYPE "MaterialTypeContent_new" USING ("contentType"::text::"MaterialTypeContent_new");
ALTER TABLE "EditRequest" ALTER COLUMN "contentType" TYPE "MaterialTypeContent_new" USING ("contentType"::text::"MaterialTypeContent_new");
ALTER TABLE "EditRequestMaterial" ALTER COLUMN "contentType" TYPE "MaterialTypeContent_new" USING ("contentType"::text::"MaterialTypeContent_new");
ALTER TYPE "MaterialTypeContent" RENAME TO "MaterialTypeContent_old";
ALTER TYPE "MaterialTypeContent_new" RENAME TO "MaterialTypeContent";
DROP TYPE "MaterialTypeContent_old";
ALTER TABLE "EditRequestMaterial" ALTER COLUMN "contentType" SET DEFAULT 'PHOTOS';
ALTER TABLE "RawMaterial" ALTER COLUMN "contentType" SET DEFAULT 'PHOTOS';
ALTER TABLE "EditedMaterial" ALTER COLUMN "contentType" SET DEFAULT 'PHOTOS';
COMMIT;
