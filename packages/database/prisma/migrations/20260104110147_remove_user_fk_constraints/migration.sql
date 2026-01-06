/*
  Warnings:

  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "emergency_contacts" DROP CONSTRAINT "emergency_contacts_userId_fkey";

-- DropForeignKey
ALTER TABLE "favorite_drivers" DROP CONSTRAINT "favorite_drivers_userId_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_assignedTo_fkey";

-- DropForeignKey
ALTER TABLE "reports" DROP CONSTRAINT "reports_reporterId_fkey";

-- DropForeignKey
ALTER TABLE "route_preferences" DROP CONSTRAINT "route_preferences_userId_fkey";

-- DropForeignKey
ALTER TABLE "saved_locations" DROP CONSTRAINT "saved_locations_userId_fkey";

-- DropForeignKey
ALTER TABLE "support_messages" DROP CONSTRAINT "support_messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_assignedTo_fkey";

-- DropForeignKey
ALTER TABLE "support_tickets" DROP CONSTRAINT "support_tickets_userId_fkey";

-- DropForeignKey
ALTER TABLE "trip_ratings" DROP CONSTRAINT "trip_ratings_userId_fkey";

-- DropForeignKey
ALTER TABLE "trips" DROP CONSTRAINT "trips_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_locations" DROP CONSTRAINT "user_locations_userId_fkey";

-- DropTable
DROP TABLE "users";
