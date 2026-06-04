-- CreateTable
CREATE TABLE "PackageTargets" (
    "id" UUID NOT NULL,
    "packageId" UUID NOT NULL,
    "targetType" TEXT NOT NULL,
    "target" TEXT NOT NULL,

    CONSTRAINT "PackageTargets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PackageTargets" ADD CONSTRAINT "PackageTargets_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
