/*
  Warnings:

  - The primary key for the `contractor_list_columns` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `contractor_list_columns` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "contractor_list_columns" DROP CONSTRAINT "contractor_list_columns_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "contractor_list_columns_pkey" PRIMARY KEY ("id");
