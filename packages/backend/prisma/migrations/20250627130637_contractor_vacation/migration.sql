-- CreateEnum
CREATE TYPE "VacationType" AS ENUM ('VACATION', 'SICK_LEAVE', 'OTHER');

-- CreateTable
CREATE TABLE "vacation" (
    "id" UUID NOT NULL,
    "contractor_id" UUID NOT NULL,
    "vacation_type" "VacationType" NOT NULL DEFAULT 'VACATION',
    "reason" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vacation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vacation" ADD CONSTRAINT "vacation_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
