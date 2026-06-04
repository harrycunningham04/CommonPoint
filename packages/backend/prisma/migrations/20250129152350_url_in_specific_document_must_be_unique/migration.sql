/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `specific_documents` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "specific_documents_url_key" ON "specific_documents"("url");
