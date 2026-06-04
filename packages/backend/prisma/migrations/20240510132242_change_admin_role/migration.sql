/*
  Warnings:

  - The values [SALES,CONTENT_CREATION,BOOKINGS,OPERATIONS] on the enum `AdminRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `isSuperAdmin` on the `admin` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AdminRole_new" AS ENUM ('ADMIN', 'SUPER_ADMIN');
ALTER TABLE "admin" ALTER COLUMN "role" TYPE "AdminRole_new" USING ("role"::text::"AdminRole_new");
ALTER TYPE "AdminRole" RENAME TO "AdminRole_old";
ALTER TYPE "AdminRole_new" RENAME TO "AdminRole";
DROP TYPE "AdminRole_old";
COMMIT;

-- AlterTable
ALTER TABLE "admin" DROP COLUMN "isSuperAdmin",
ALTER COLUMN "role" SET DEFAULT 'ADMIN';
