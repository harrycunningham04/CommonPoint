-- CreateEnum
CREATE TYPE "WidgetType" AS ENUM ('WEATHER', 'BOOKINGS', 'CALENDAR', 'MAP', 'CONTRACTORS', 'ADMINS', 'BOOKINGS_ORDERS', 'CLIENTS', 'DISPUTES', 'NOTIFICATIONS', 'STATISTICS');

-- CreateEnum
CREATE TYPE "WidgetSize" AS ENUM ('SMALL', 'BIG');

-- CreateTable
CREATE TABLE "widget" (
    "id" UUID NOT NULL,
    "name" "WidgetType" NOT NULL,
    "type" "WidgetSize" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "widget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_widget" (
    "id" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "widgetId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_widget_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_widget_adminId_widgetId_key" ON "admin_widget"("adminId", "widgetId");

-- AddForeignKey
ALTER TABLE "admin_widget" ADD CONSTRAINT "admin_widget_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_widget" ADD CONSTRAINT "admin_widget_widgetId_fkey" FOREIGN KEY ("widgetId") REFERENCES "widget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
