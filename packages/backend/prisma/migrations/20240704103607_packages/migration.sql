-- CreateTable
CREATE TABLE "Package" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageProducts" (
    "packageId" UUID NOT NULL,
    "productId" UUID NOT NULL,

    CONSTRAINT "PackageProducts_pkey" PRIMARY KEY ("packageId","productId")
);

-- AddForeignKey
ALTER TABLE "PackageProducts" ADD CONSTRAINT "PackageProducts_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageProducts" ADD CONSTRAINT "PackageProducts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
