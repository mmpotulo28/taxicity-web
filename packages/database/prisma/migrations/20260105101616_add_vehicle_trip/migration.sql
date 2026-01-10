-- CreateEnum
CREATE TYPE "VehicleTripStatus" AS ENUM ('SCHEDULED', 'BOARDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "vehicleTripId" TEXT;

-- CreateTable
CREATE TABLE "vehicle_trips" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "driverId" TEXT NOT NULL,
    "taxiId" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "status" "VehicleTripStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "capacity" INTEGER NOT NULL,

    CONSTRAINT "vehicle_trips_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_vehicleTripId_fkey" FOREIGN KEY ("vehicleTripId") REFERENCES "vehicle_trips"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_trips" ADD CONSTRAINT "vehicle_trips_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_trips" ADD CONSTRAINT "vehicle_trips_taxiId_fkey" FOREIGN KEY ("taxiId") REFERENCES "taxis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_trips" ADD CONSTRAINT "vehicle_trips_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
