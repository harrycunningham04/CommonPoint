-- CreateTable
CREATE TABLE "XeroConnection" (
    "id" UUID NOT NULL,
    "accessToken" VARCHAR(2048) NOT NULL,
    "refreshToken" VARCHAR(2048) NOT NULL,
    "tenantId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "idToken" VARCHAR(2048),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "XeroConnection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "XeroConnection_tenantId_key" ON "XeroConnection"("tenantId");
