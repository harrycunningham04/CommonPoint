-- CreateTable
CREATE TABLE "Worker" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(30) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "office_id" UUID NOT NULL,
    "notification_preferences" "NotificationPreferences"[] DEFAULT ARRAY[]::"NotificationPreferences"[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_office_id_fkey" FOREIGN KEY ("office_id") REFERENCES "Office"("id") ON DELETE CASCADE ON UPDATE CASCADE;
