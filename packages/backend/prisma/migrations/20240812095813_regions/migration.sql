-- CreateTable
CREATE TABLE "ContractorRegion" (
    "contractorId" UUID NOT NULL,
    "regionId" UUID NOT NULL,

    CONSTRAINT "ContractorRegion_pkey" PRIMARY KEY ("contractorId","regionId")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ContractorRegion" ADD CONSTRAINT "ContractorRegion_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorRegion" ADD CONSTRAINT "ContractorRegion_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE CASCADE ON UPDATE CASCADE;
