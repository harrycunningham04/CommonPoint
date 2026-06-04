/*
  Warnings:

  - You are about to drop the column `session_id` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "session_id";

-- AlterTable
ALTER TABLE "BookingGroup" ADD COLUMN     "session_id" VARCHAR(200);
