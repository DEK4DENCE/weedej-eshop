import crypto from 'crypto'

/**
 * Generates a cryptographically secure random token
 * @returns 64-character hex string token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Generates a token expiry date
 * @param hours - Hours until expiry (default: 1)
 * @returns Date object representing expiry time
 */
export function generateTokenExpiry(hours: number = 1): Date {
  const expiry = new Date()
  expiry.setHours(expiry.getHours() + hours)
  return expiry
}
