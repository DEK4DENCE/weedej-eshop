/**
 * Formats a number as a currency string in EUR
 * @param amount - Amount in full currency units (e.g., 9.99)
 * @param currency - Currency code (default: 'EUR')
 * @returns Formatted currency string (e.g., '€9.99')
 */
export function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Formats a price stored as cents/integers
 * @param amountInCents - Amount in smallest currency unit (cents)
 * @param currency - Currency code (default: 'EUR')
 */
export function formatPriceFromCents(amountInCents: number, currency: string = 'EUR'): string {
  return formatPrice(amountInCents / 100, currency)
}
