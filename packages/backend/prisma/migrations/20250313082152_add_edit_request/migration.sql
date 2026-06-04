-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "isEditRequest" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "EditRequest" (
    "id" UUID NOT NULL,
    "requestedChange" TEXT NOT NULL DEFAULT '',
    "editedMaterialId" UUID NOT NULL,

    CONSTRAINT "EditRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EditRequestMaterial" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "url" VARCHAR(200) NOT NULL,
    "thumbnailUrl" VARCHAR(200),
    "contentType" "MaterialTypeContent" NOT NULL DEFAULT 'PHOTOS',
    "fileSize" INTEGER,
    "mimetype" TEXT,
    "editRequestId" UUID NOT NULL,

    CONSTRAINT "EditRequestMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EditRequest_editedMaterialId_key" ON "EditRequest"("editedMaterialId");

-- CreateIndex
CREATE UNIQUE INDEX "EditRequestMaterial_editRequestId_key" ON "EditRequestMaterial"("editRequestId");

-- AddForeignKey
ALTER TABLE "EditRequest" ADD CONSTRAINT "EditRequest_editedMaterialId_fkey" FOREIGN KEY ("editedMaterialId") REFERENCES "EditedMaterial"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EditRequestMaterial" ADD CONSTRAINT "EditRequestMaterial_editRequestId_fkey" FOREIGN KEY ("editRequestId") REFERENCES "EditRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
