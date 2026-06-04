-- CreateTable
CREATE TABLE "contractor_training" (
    "contractor_id" UUID NOT NULL,
    "training_id" UUID NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "contractor_training_pkey" PRIMARY KEY ("contractor_id","training_id")
);

-- AddForeignKey
ALTER TABLE "contractor_training" ADD CONSTRAINT "contractor_training_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contractor_training" ADD CONSTRAINT "contractor_training_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "training"("id") ON DELETE CASCADE ON UPDATE CASCADE;
