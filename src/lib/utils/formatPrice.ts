/**
 * Formats a number as a currency string in CZK
 * @param amount - Amount in full currency units (e.g., 499)
 * @param currency - Currency code (default: 'CZK')
 * @returns Formatted currency string (e.g., '499 Kč')
 */
export function formatPrice(amount: number, currency: string = 'CZK'): string {
  return new Intl.NumberFormat('cs-CZ', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Formats a price stored as hellers/integers
 * @param amountInCents - Amount in smallest currency unit (hellers)
 * @param currency - Currency code (default: 'CZK')
 */
export function formatPriceFromCents(amountInCents: number, currency: string = 'CZK'): string {
  return formatPrice(amountInCents / 100, currency)
}
