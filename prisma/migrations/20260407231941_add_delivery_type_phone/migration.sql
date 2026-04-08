-- CreateEnum
CREATE TYPE "DeliveryType" AS ENUM ('COURIER', 'PICKUP_IN_STORE');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryType" "DeliveryType" NOT NULL DEFAULT 'COURIER';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;
