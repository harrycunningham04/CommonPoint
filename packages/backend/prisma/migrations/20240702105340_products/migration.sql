-- CreateTable
CREATE TABLE "ProductType" (
    "id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "description_contractor" TEXT,
    "description_client" TEXT,
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "skills" TEXT[],

    CONSTRAINT "ProductType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" UUID NOT NULL,
    "productTypeId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "requiresOnSiteContractor" BOOLEAN NOT NULL,
    "skillId" UUID NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_productTypeId_fkey" FOREIGN KEY ("productTypeId") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;
