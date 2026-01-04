-- CreateTable
CREATE TABLE "popular_locations" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "type" TEXT,
    "routeId" TEXT NOT NULL,

    CONSTRAINT "popular_locations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "popular_locations" ADD CONSTRAINT "popular_locations_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
