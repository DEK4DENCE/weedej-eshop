-- Add billing address snapshot columns to Order.
-- All columns are nullable — existing orders keep NULL (billing = delivery address).
-- Idempotent: IF NOT EXISTS prevents failure if already applied via db push.

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "billingName"    TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "billingCompany" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "billingIco"     TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "billingStreet"  TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "billingCity"    TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "billingZip"     TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "billingCountry" TEXT;
