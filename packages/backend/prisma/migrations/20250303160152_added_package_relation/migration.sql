-- CreateTable
CREATE TABLE "PackageProductType" (
    "packageId" UUID NOT NULL,
    "productTypeId" UUID NOT NULL,

    CONSTRAINT "PackageProductType_pkey" PRIMARY KEY ("packageId","productTypeId")
);

-- AddForeignKey
ALTER TABLE "PackageProductType" ADD CONSTRAINT "PackageProductType_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageProductType" ADD CONSTRAINT "PackageProductType_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
