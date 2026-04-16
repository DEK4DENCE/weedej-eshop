-- CreateEnum
CREATE TYPE "ActiveSubstance" AS ENUM ('CBD', 'THC', 'THC_X', 'HHC');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "activeSubstance" "ActiveSubstance";

-- Auto-assign THC_X to products whose name contains "(THC-X)"
UPDATE "Product" SET "activeSubstance" = 'THC_X' WHERE name ILIKE '%(THC-X)%' AND "activeSubstance" IS NULL;

-- Strip "(THC-X)" suffix from product names (with leading space or without)
UPDATE "Product" SET name = TRIM(REGEXP_REPLACE(name, '\s*\(THC-X\)\s*', '', 'g')) WHERE name ILIKE '%(THC-X)%';
