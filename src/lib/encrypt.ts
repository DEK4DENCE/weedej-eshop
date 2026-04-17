// SECURITY-5: Field-level encryption for sensitive settings stored in DB
// Uses AES-256-GCM. Requires SETTINGS_ENCRYPTION_KEY env var (any passphrase).
// Values are stored as `enc:iv_hex:tag_hex:ciphertext_hex`.
// Gracefully falls back to plaintext if the key is not set (dev/CI environments).

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_PREFIX = 'enc:'

function deriveKey(): Buffer | null {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY
  if (!secret) return null
  return scryptSync(secret, 'weedej-settings-v1', 32)
}

export function encryptSetting(plaintext: string): string {
  const key = deriveKey()
  if (!key) return plaintext  // no key configured — store plaintext (dev)

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
  if (!value.startsWith(ENCRYPTION_PREFIX)) return value  // plaintext — return as-is

  const key = deriveKey()
  if (!key) return value  // no key — can't decrypt, return raw (will be opaque)

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
