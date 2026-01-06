-- DropForeignKey
ALTER TABLE "trips" DROP CONSTRAINT "trips_taxiId_fkey";

-- AlterTable
ALTER TABLE "trips" ALTER COLUMN "taxiId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_taxiId_fkey" FOREIGN KEY ("taxiId") REFERENCES "taxis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
