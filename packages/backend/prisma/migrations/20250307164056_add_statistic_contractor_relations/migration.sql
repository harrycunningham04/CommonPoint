-- AddForeignKey
ALTER TABLE "statistic" ADD CONSTRAINT "statistic_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
