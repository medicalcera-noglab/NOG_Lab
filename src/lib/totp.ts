/**
 * TOTP helpers using otplib v13 (ESM, explicit crypto + base32 plugins).
 */
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib'
import { toDataURL } from 'qrcode'
import { randomBytes, createHash, timingSafeEqual } from 'crypto'
import { encryptTotpSecret, decryptTotpSecret } from './totpCrypto'

export const TOTP_ISSUER = 'NOG Lab'
export const BACKUP_CODE_COUNT = 10

// Shared plugin instances — stateless, safe to reuse.
const cryptoPlugin = new NobleCryptoPlugin()
const base32Plugin = new ScureBase32Plugin()

function makeTotpInstance(overrides: ConstructorParameters<typeof TOTP>[0] = {}): TOTP {
  return new TOTP({ crypto: cryptoPlugin, base32: base32Plugin, ...overrides })
}

/** Generate a new TOTP secret and its otpauth:// URI. */
export async function generateTotpSecret(
  userEmail: string,
): Promise<{ secret: string; otpauthUri: string }> {
  const totp = makeTotpInstance()
  const secret = totp.generateSecret()
  const totpForUri = makeTotpInstance({ issuer: TOTP_ISSUER, label: userEmail, secret })
  const otpauthUri = totpForUri.toURI()
  return { secret, otpauthUri }
}

/** Render the otpauth URI as a base64 PNG data URL for QR display. */
export async function generateQrDataUrl(otpauthUri: string): Promise<string> {
  return toDataURL(otpauthUri, { width: 200, margin: 2 })
}

/**
 * Verify a 6-digit token against a plaintext secret.
 * epochTolerance: 30s = ±1 TOTP period to handle clock skew.
 */
export async function verifyTotpToken(token: string, plaintextSecret: string): Promise<boolean> {
  const totp = makeTotpInstance()
  const result = await totp.verify(token, { secret: plaintextSecret, epochTolerance: 30 })
  return result.valid
}

/** Encrypt the TOTP secret for DB storage. */
export function encryptSecret(secret: string): string {
  return encryptTotpSecret(secret)
}

/** Decrypt a stored ciphertext back to the plaintext secret. */
export function decryptSecret(ciphertext: string): string {
  return decryptTotpSecret(ciphertext)
}

function hashBackupCode(code: string): string {
  return createHash('sha256').update(code).digest('hex')
}

/** Generate BACKUP_CODE_COUNT single-use backup codes. Plaintext shown once; hashes stored. */
export function generateBackupCodes(): { plaintext: string[]; hashes: string[] } {
  const plaintext = Array.from({ length: BACKUP_CODE_COUNT }, () =>
    randomBytes(5).toString('hex').toUpperCase(),
  )
  const hashes = plaintext.map(hashBackupCode)
  return { plaintext, hashes }
}

/**
 * Try to consume a backup code. Returns updated hashes on success, or null if invalid.
 * Timing-safe to prevent oracle attacks.
 */
export function consumeBackupCode(inputCode: string, storedHashes: string[]): string[] | null {
  const inputHash = hashBackupCode(inputCode.trim().toUpperCase())
  const inputBuf = Buffer.from(inputHash, 'hex')
  let matchIndex = -1
  for (let i = 0; i < storedHashes.length; i++) {
    const storedBuf = Buffer.from(storedHashes[i], 'hex')
    if (timingSafeEqual(inputBuf, storedBuf)) matchIndex = i
  }
  if (matchIndex === -1) return null
  return storedHashes.filter((_, i) => i !== matchIndex)
}
