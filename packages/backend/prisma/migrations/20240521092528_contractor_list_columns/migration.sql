-- CreateTable
CREATE TABLE "contractor_list_columns" (
    "id" TEXT NOT NULL,
    "skills" BOOLEAN NOT NULL DEFAULT true,
    "mark" BOOLEAN NOT NULL DEFAULT true,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "address" BOOLEAN NOT NULL DEFAULT true,
    "rating" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "contractor_list_columns_pkey" PRIMARY KEY ("id")
);
