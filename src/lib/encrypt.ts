// SECURITY-5: Field-level encryption for sensitive settings stored in DB
// Uses AES-256-GCM. Requires SETTINGS_ENCRYPTION_KEY env var (any passphrase).
// Values are stored as `enc:iv_hex:tag_hex:ciphertext_hex`.
// SETTINGS_ENCRYPTION_KEY MUST be set — plaintext writes are never allowed.

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_PREFIX = 'enc:'

function deriveKey(): Buffer {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY
  if (!secret) {
    throw new Error('SETTINGS_ENCRYPTION_KEY environment variable is required')
  }
  return scryptSync(secret, 'weedej-settings-v1', 32)
}

export function encryptSetting(plaintext: string): string {
  const key = deriveKey()

  const iv = randomBytes(16)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return (
    ENCRYPTION_PREFIX +
    [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':')
  )
}

export function decryptSetting(value: string): string {
  // Legacy plaintext data (no enc: prefix) — return as-is with a warning
  if (!value.startsWith(ENCRYPTION_PREFIX)) {
    console.warn('[encrypt] decryptSetting: value does not have encrypted prefix — returning as-is (legacy plaintext data)')
    return value
  }

  const key = deriveKey()

  try {
    const parts = value.slice(ENCRYPTION_PREFIX.length).split(':')
    if (parts.length !== 3) return value
    const [ivHex, tagHex, encHex] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')
    const enc = Buffer.from(encHex, 'hex')

    const decipher = createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(tag)
    return decipher.update(enc).toString('utf8') + decipher.final('utf8')
  } catch {
    return value  // decryption failed — return as-is
  }
}

// Keys that contain sensitive credentials and should be encrypted at rest
export const SENSITIVE_SETTING_KEYS = new Set(['erpApiKey', 'erpApiUrl', 'resendApiKey'])
