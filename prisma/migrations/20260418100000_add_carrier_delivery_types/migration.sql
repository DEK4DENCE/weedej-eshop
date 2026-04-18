-- AlterEnum
ALTER TYPE "DeliveryType" ADD VALUE 'DPD_HOME';
ALTER TYPE "DeliveryType" ADD VALUE 'DPD_PICKUP';
ALTER TYPE "DeliveryType" ADD VALUE 'ZASILKOVNA_HOME';
ALTER TYPE "DeliveryType" ADD VALUE 'ZASILKOVNA_PICKUP';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "pickupPointId" TEXT,
ADD COLUMN "pickupPointName" TEXT,
ADD COLUMN "pickupPointAddress" TEXT;
