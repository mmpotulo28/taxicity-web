-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'SUCCESS', 'WARNING', 'ERROR', 'TRIP_UPDATE', 'PAYMENT');

-- AlterTable
ALTER TABLE "vehicle_trips" ADD COLUMN     "manualPassengers" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "data" JSONB,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
