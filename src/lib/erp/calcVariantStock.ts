/**
 * Vypočítá počet kusů varianty z celkového skladu ERP produktu.
 *
 * Logika:
 *  - variantValue=null  → varianta nemá definovanou velikost → vrátí celý sklad jako kusy
 *  - unit mismatch       → konfigurace je chybná, bezpečně vrátí 0
 *  - jinak               → floor(erpStock / variantValue)
 *
 * Příklady:
 *  calcVariantStock(3000, "g",  100,  "g")  → 30   (3000g ÷ 100g = 30 balení)
 *  calcVariantStock(2000, "ml", 30,   "ml") → 66   (2000ml ÷ 30ml = 66 lahviček)
 *  calcVariantStock(50,   "ks", 1,    "ks") → 50   (50 ks ÷ 1 ks = 50 kusů)
 *  calcVariantStock(50,   "ks", 3,    "ks") → 16   (50 ks ÷ 3 ks = 16 balení po 3)
 *  calcVariantStock(3000, "g",  null, null) → 3000 (bez variantValue → přímý sklad)
 */
export function calcVariantStock(
  erpStock: number,
  erpUnit: string,
  variantValue: number | null | undefined,
  variantUnit: string | null | undefined,
): number {
  if (!variantValue || variantValue <= 0) return Math.max(0, Math.floor(erpStock))
  const effectiveUnit = variantUnit ?? erpUnit
  if (effectiveUnit !== erpUnit) return 0
  return Math.max(0, Math.floor(erpStock / variantValue))
}
