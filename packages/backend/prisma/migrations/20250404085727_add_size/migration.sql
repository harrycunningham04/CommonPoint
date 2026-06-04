/*
  Warnings:

  - You are about to drop the column `link` on the `ESoftHttpFile` table. All the data in the column will be lost.
  - Added the required column `size` to the `ESoftHttpFile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ESoftHttpFile" DROP COLUMN "link",
ADD COLUMN     "size" INTEGER NOT NULL;
