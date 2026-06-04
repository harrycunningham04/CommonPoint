/*
  Warnings:

  - You are about to drop the column `file` on the `specific_documents` table. All the data in the column will be lost.
  - Added the required column `url` to the `specific_documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "specific_documents" DROP COLUMN "file",
ADD COLUMN     "url" VARCHAR(200) NOT NULL;
