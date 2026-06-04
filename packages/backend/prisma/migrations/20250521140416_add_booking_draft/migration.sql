-- CreateTable
CREATE TABLE "draft_booking" (
    "id" UUID NOT NULL,
    "info" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "draft_booking_pkey" PRIMARY KEY ("id")
);
