/**
 * AES-256-GCM encryption/decryption for TOTP secrets stored at rest.
 * Key source: TOTP_ENCRYPTION_KEY env var (32-byte hex string).
 * Output format: "<iv_hex>:<ciphertext_hex>:<authTag_hex>"
 */
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto'

function getKey(): Buffer {
  const raw = process.env.TOTP_ENCRYPTION_KEY ?? ''
  if (raw.length < 64) {
    // In dev without a key, derive a deterministic key from PAYLOAD_SECRET so
    // the app boots — but warn loudly. NEVER do this in production.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('TOTP_ENCRYPTION_KEY must be set in production')
    }
    const fallback = process.env.PAYLOAD_SECRET ?? 'dev-insecure-fallback'
    return createHash('sha256').update(fallback).digest()
  }
  return Buffer.from(raw, 'hex')
}

export function encryptTotpSecret(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(12) // 96-bit IV for GCM
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${encrypted.toString('hex')}:${authTag.toString('hex')}`
}

export function decryptTotpSecret(ciphertext: string): string {
  const [ivHex, encHex, tagHex] = ciphertext.split(':')
  if (!ivHex || !encHex || !tagHex) throw new Error('Invalid ciphertext format')
  const key = getKey()
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))
  return decipher.update(Buffer.from(encHex, 'hex')).toString('utf8') + decipher.final('utf8')
}
