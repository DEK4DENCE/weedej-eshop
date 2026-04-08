import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 12

/**
 * Hashes a plain-text password using bcrypt
 * @param password - Plain-text password to hash
 * @returns Hashed password string
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Compares a plain-text password against a bcrypt hash
 * @param password - Plain-text password to verify
 * @param hash - Stored bcrypt hash to compare against
 * @returns True if passwords match, false otherwise
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}
