-- Safe migration: adds columns and enum values that may be missing in production.
-- Uses IF NOT EXISTS / DO blocks so it's idempotent if already applied via db push.

-- Add missing DeliveryType enum values (IF NOT EXISTS requires PostgreSQL 12+)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
                 WHERE t.typname = 'DeliveryType' AND e.enumlabel = 'DPD_HOME') THEN
    ALTER TYPE "DeliveryType" ADD VALUE 'DPD_HOME';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
                 WHERE t.typname = 'DeliveryType' AND e.enumlabel = 'DPD_PICKUP') THEN
    ALTER TYPE "DeliveryType" ADD VALUE 'DPD_PICKUP';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
                 WHERE t.typname = 'DeliveryType' AND e.enumlabel = 'ZASILKOVNA_HOME') THEN
    ALTER TYPE "DeliveryType" ADD VALUE 'ZASILKOVNA_HOME';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid
                 WHERE t.typname = 'DeliveryType' AND e.enumlabel = 'ZASILKOVNA_PICKUP') THEN
    ALTER TYPE "DeliveryType" ADD VALUE 'ZASILKOVNA_PICKUP';
  END IF;
END $$;

-- Add missing Order columns
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pickupPointId"      TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pickupPointName"    TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "pickupPointAddress" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippedAt"          TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deliveredAt"        TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "carrier"            TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "trackingNumber"     TEXT;

-- Add missing User column (sessionVersion for session invalidation)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "sessionVersion" INTEGER NOT NULL DEFAULT 1;
