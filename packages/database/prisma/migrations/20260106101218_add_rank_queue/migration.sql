-- CreateTable
CREATE TABLE "rank_queue_entries" (
    "id" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rankId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "taxiId" TEXT,

    CONSTRAINT "rank_queue_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rank_queue_entries_driverId_key" ON "rank_queue_entries"("driverId");

-- AddForeignKey
ALTER TABLE "rank_queue_entries" ADD CONSTRAINT "rank_queue_entries_rankId_fkey" FOREIGN KEY ("rankId") REFERENCES "ranks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_queue_entries" ADD CONSTRAINT "rank_queue_entries_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "drivers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_queue_entries" ADD CONSTRAINT "rank_queue_entries_taxiId_fkey" FOREIGN KEY ("taxiId") REFERENCES "taxis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
