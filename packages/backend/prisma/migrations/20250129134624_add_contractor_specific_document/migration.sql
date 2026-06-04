-- CreateEnum
CREATE TYPE "SpecificDocumentType" AS ENUM ('CERTIFICATE', 'INSURANCE');

-- CreateTable
CREATE TABLE "specific_documents" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "file" VARCHAR(200) NOT NULL,
    "expiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "SpecificDocumentType" NOT NULL DEFAULT 'CERTIFICATE',
    "contractor_id" UUID NOT NULL,

    CONSTRAINT "specific_documents_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "specific_documents" ADD CONSTRAINT "specific_documents_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
