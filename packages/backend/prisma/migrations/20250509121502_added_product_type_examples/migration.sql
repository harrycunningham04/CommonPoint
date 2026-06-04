-- CreateTable
CREATE TABLE "product_type_example" (
    "id" UUID NOT NULL,
    "product_type_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "url" VARCHAR(512) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_type_example_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "product_type_example" ADD CONSTRAINT "product_type_example_product_type_id_fkey" FOREIGN KEY ("product_type_id") REFERENCES "ProductType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
