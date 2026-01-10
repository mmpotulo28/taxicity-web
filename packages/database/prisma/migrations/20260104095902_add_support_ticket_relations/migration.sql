/*
  Warnings:

  - You are about to drop the column `sender` on the `support_messages` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ticketNumber]` on the table `support_tickets` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `support_tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketNumber` to the `support_tickets` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "TicketCategory" AS ENUM ('ACCOUNT_ISSUE', 'PAYMENT_PROBLEM', 'TECHNICAL_SUPPORT', 'BOOKING_ISSUE', 'DRIVER_COMPLAINT', 'FEATURE_REQUEST', 'BUG_REPORT', 'OTHER');

-- AlterTable
ALTER TABLE "support_messages" DROP COLUMN "sender",
ADD COLUMN     "attachments" TEXT[],
ADD COLUMN     "isInternal" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "senderId" TEXT;

-- AlterTable
ALTER TABLE "support_tickets" ADD COLUMN     "attachments" TEXT[],
ADD COLUMN     "category" "TicketCategory" NOT NULL,
ADD COLUMN     "contactMethod" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "priority" "TicketPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "ticketNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "support_tickets_ticketNumber_key" ON "support_tickets"("ticketNumber");

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_tickets" ADD CONSTRAINT "support_tickets_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "support_messages" ADD CONSTRAINT "support_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
