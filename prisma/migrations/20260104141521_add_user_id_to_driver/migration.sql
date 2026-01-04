/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `drivers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "drivers" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "taxis" ADD COLUMN     "permitDoc" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "drivers_userId_key" ON "drivers"("userId");
