-- CreateTable
CREATE TABLE "BookingCGISubmittedMaterial" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "mimetype" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "clientPhotoId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookingCGISubmittedMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BookingCGISubmittedMaterial_clientPhotoId_key" ON "BookingCGISubmittedMaterial"("clientPhotoId");

-- AddForeignKey
ALTER TABLE "BookingCGISubmittedMaterial" ADD CONSTRAINT "BookingCGISubmittedMaterial_clientPhotoId_fkey" FOREIGN KEY ("clientPhotoId") REFERENCES "booking_cgi_client_photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
