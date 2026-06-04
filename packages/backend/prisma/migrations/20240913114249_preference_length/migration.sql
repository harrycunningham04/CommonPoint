-- AlterEnum
ALTER TYPE "WidgetSize" ADD VALUE 'FULLSCREEN';

-- AlterTable
ALTER TABLE "Preference" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "admin_widget" ADD COLUMN     "defaultSize" "WidgetSize" NOT NULL DEFAULT 'SMALL',
ADD COLUMN     "size" "WidgetSize" NOT NULL DEFAULT 'SMALL';
