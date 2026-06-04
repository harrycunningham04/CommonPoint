-- CreateTable
CREATE TABLE "cotractor_statistics_columns" (
    "id" SERIAL NOT NULL,
    "photoSLA" BOOLEAN NOT NULL DEFAULT true,
    "sketchSLA" BOOLEAN NOT NULL DEFAULT true,
    "contentSLA" BOOLEAN NOT NULL DEFAULT true,
    "floorplanSLA" BOOLEAN NOT NULL DEFAULT true,
    "earning" BOOLEAN NOT NULL DEFAULT true,
    "avgComplRate" BOOLEAN NOT NULL DEFAULT true,
    "avgPhotoCapture" BOOLEAN NOT NULL DEFAULT true,
    "avgJobPerWeek" BOOLEAN NOT NULL DEFAULT true,
    "totalJobsDone" BOOLEAN NOT NULL DEFAULT true,
    "howOftenOnTime" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cotractor_statistics_columns_pkey" PRIMARY KEY ("id")
);
