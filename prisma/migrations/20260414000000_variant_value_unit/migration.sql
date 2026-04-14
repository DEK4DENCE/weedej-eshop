-- Migration: variant_value_unit
-- Nahrazuje weightGrams (Float) za variantValue (Float) + variantUnit (Text)
-- Stávající data: weightGrams → variantValue s variantUnit = 'g'

-- 1. Přidej nová pole
ALTER TABLE "ProductVariant" ADD COLUMN "variantValue" DOUBLE PRECISION;
ALTER TABLE "ProductVariant" ADD COLUMN "variantUnit" TEXT;

-- 2. Migruj stávající data (weightGrams → variantValue, jednotka = 'g')
UPDATE "ProductVariant"
SET "variantValue" = "weightGrams",
    "variantUnit"  = 'g'
WHERE "weightGrams" IS NOT NULL;

-- 3. Odeber původní sloupec
ALTER TABLE "ProductVariant" DROP COLUMN "weightGrams";
