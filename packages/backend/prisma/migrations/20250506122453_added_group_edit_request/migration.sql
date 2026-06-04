-- CreateEnum
CREATE TYPE "EditRequestType" AS ENUM ('SINGLE', 'GROUP_BY_CONTENT_TYPE');

-- AlterTable
ALTER TABLE "EditRequest" ADD COLUMN     "bookingId" UUID,
ADD COLUMN     "contentType" "MaterialTypeContent",
ADD COLUMN     "type" "EditRequestType" NOT NULL DEFAULT 'SINGLE',
ALTER COLUMN "editedMaterialId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EditRequest" ADD CONSTRAINT "EditRequest_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
