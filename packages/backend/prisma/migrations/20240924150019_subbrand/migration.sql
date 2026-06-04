-- CreateTable
CREATE TABLE "Subbrand" (
    "id" UUID NOT NULL,
    "companyName" TEXT NOT NULL,
    "email" TEXT,
    "phoneNumber" TEXT,
    "address" TEXT,
    "billingAddress" TEXT,
    "parentBrandId" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subbrand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Subbrands" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_Subbrands_AB_unique" ON "_Subbrands"("A", "B");

-- CreateIndex
CREATE INDEX "_Subbrands_B_index" ON "_Subbrands"("B");

-- AddForeignKey
ALTER TABLE "Subbrand" ADD CONSTRAINT "Subbrand_parentBrandId_fkey" FOREIGN KEY ("parentBrandId") REFERENCES "B2BClients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Subbrands" ADD CONSTRAINT "_Subbrands_A_fkey" FOREIGN KEY ("A") REFERENCES "B2BClients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Subbrands" ADD CONSTRAINT "_Subbrands_B_fkey" FOREIGN KEY ("B") REFERENCES "Subbrand"("id") ON DELETE CASCADE ON UPDATE CASCADE;
