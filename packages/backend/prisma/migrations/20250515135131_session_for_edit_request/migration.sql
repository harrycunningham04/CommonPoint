-- AlterTable
ALTER TABLE "EditRequest" ADD COLUMN     "sessionId" UUID;

-- CreateTable
CREATE TABLE "EditRequestSession" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EditRequestSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EditRequest" ADD CONSTRAINT "EditRequest_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "EditRequestSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditRequestSession" ADD CONSTRAINT "EditRequestSession_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
