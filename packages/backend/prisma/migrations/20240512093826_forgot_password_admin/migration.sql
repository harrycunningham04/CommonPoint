-- AlterTable
ALTER TABLE "admin" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "forgot_password" ALTER COLUMN "office_worker_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "forgot_password_admin" (
    "id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "forgot_password_admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "forgot_password_admin_admin_id_key" ON "forgot_password_admin"("admin_id");

-- CreateIndex
CREATE INDEX "forgot_password_admin_admin_id_idx" ON "forgot_password_admin"("admin_id");

-- AddForeignKey
ALTER TABLE "forgot_password_admin" ADD CONSTRAINT "forgot_password_admin_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
