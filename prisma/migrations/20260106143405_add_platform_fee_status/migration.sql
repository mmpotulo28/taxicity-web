-- CreateEnum
CREATE TYPE "PlatformFeeStatus" AS ENUM ('PENDING', 'PAID', 'WAIVED');

-- AlterTable
ALTER TABLE "trips" ADD COLUMN     "platformFeeStatus" "PlatformFeeStatus" NOT NULL DEFAULT 'PENDING';
