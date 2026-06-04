-- CreateTable
CREATE TABLE "user_devices" (
    "id" TEXT NOT NULL,
    "oneSignalId" VARCHAR(255),
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "muteExpiry" TIMESTAMP,
    "ownerId" UUID NOT NULL,

    CONSTRAINT "user_devices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_devices_oneSignalId_key" ON "user_devices"("oneSignalId");

-- AddForeignKey
ALTER TABLE "user_devices" ADD CONSTRAINT "user_devices_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
