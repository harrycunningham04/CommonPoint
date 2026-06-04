-- CreateTable
CREATE TABLE "OfficeHiddenProduct" (
    "id" UUID NOT NULL,
    "office_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,

    CONSTRAINT "OfficeHiddenProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OfficeHiddenProduct_office_id_product_id_key" ON "OfficeHiddenProduct"("office_id", "product_id");

-- AddForeignKey
ALTER TABLE "OfficeHiddenProduct" ADD CONSTRAINT "OfficeHiddenProduct_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficeHiddenProduct" ADD CONSTRAINT "OfficeHiddenProduct_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
