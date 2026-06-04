/*
  Warnings:

  - A unique constraint covering the columns `[b2bClientId,preferenceId]` on the table `ClientB2BPreference` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clientId,preferenceId]` on the table `ClientB2CPreference` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[officeId,preferenceId]` on the table `OfficePreference` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "EditRequest" ADD COLUMN     "clientDisputeId" UUID,
ADD COLUMN     "clientUploadedPhotoUrl" VARCHAR(2048);

-- AlterTable
ALTER TABLE "EditRequestSession" ADD COLUMN     "clientDisputeId" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "ClientB2BPreference_b2bClientId_preferenceId_key" ON "ClientB2BPreference"("b2bClientId", "preferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientB2CPreference_clientId_preferenceId_key" ON "ClientB2CPreference"("clientId", "preferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "OfficePreference_officeId_preferenceId_key" ON "OfficePreference"("officeId", "preferenceId");

-- AddForeignKey
ALTER TABLE "EditRequest" ADD CONSTRAINT "EditRequest_clientDisputeId_fkey" FOREIGN KEY ("clientDisputeId") REFERENCES "ClientDispute"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditRequestSession" ADD CONSTRAINT "EditRequestSession_clientDisputeId_fkey" FOREIGN KEY ("clientDisputeId") REFERENCES "ClientDispute"("id") ON DELETE CASCADE ON UPDATE CASCADE;
