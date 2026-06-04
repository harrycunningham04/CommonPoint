-- CreateTable
CREATE TABLE "Report" (
    "id" UUID NOT NULL,
    "location" VARCHAR(100) NOT NULL,
    "problem" VARCHAR(100) NOT NULL,
    "solution" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "contractor_dispute_id" UUID NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Report_contractor_dispute_id_key" ON "Report"("contractor_dispute_id");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_contractor_dispute_id_fkey" FOREIGN KEY ("contractor_dispute_id") REFERENCES "ContractorDispute"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
