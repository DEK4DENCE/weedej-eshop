/**
 * Converts an arbitrary text string into a URL-safe slug.
 * Strips diacritics, lowercases, replaces non-alphanumeric runs with a single
 * hyphen, and trims leading/trailing hyphens.
 *
 * Examples:
 *  generateSlug("Pineapple Express")  → "pineapple-express"
 *  generateSlug("Mléčná čokoláda")   → "mlecna-cokolada"
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
