import { describe, it, expect, beforeAll } from 'vitest'
import { TOTP, NobleCryptoPlugin, ScureBase32Plugin } from 'otplib'
import {
  generateTotpSecret,
  verifyTotpToken,
  encryptSecret,
  decryptSecret,
  generateBackupCodes,
  consumeBackupCode,
  BACKUP_CODE_COUNT,
} from '../totp'
import { encryptTotpSecret, decryptTotpSecret } from '../totpCrypto'

beforeAll(() => {
  process.env.TOTP_ENCRYPTION_KEY = 'a'.repeat(64) // 32 bytes hex
})

describe('TOTP secret generation', () => {
  it('generates a secret and otpauth URI', async () => {
    const { secret, otpauthUri } = await generateTotpSecret('user@example.com')
    expect(secret).toBeTruthy()
    expect(otpauthUri).toMatch(/^otpauth:\/\/totp\//)
    expect(otpauthUri).toContain('NOG%20Lab')
  })
})

describe('TOTP encryption — secret never leaks', () => {
  it('encrypts and decrypts to the same plaintext', async () => {
    const { secret } = await generateTotpSecret('x@x.com')
    const cipher = encryptTotpSecret(secret)
    expect(cipher).not.toContain(secret)
    expect(decryptTotpSecret(cipher)).toBe(secret)
  })

  it('encryptSecret / decryptSecret round-trips correctly', async () => {
    const { secret } = await generateTotpSecret('x@x.com')
    expect(decryptSecret(encryptSecret(secret))).toBe(secret)
  })

  it('ciphertext changes on each call (random IV)', async () => {
    const { secret } = await generateTotpSecret('x@x.com')
    const c1 = encryptTotpSecret(secret)
    const c2 = encryptTotpSecret(secret)
    expect(c1).not.toBe(c2)
  })

  it('rejects a tampered ciphertext (auth tag flip)', async () => {
    const { secret } = await generateTotpSecret('x@x.com')
    const cipher = encryptTotpSecret(secret)
    const [iv, enc, tag] = cipher.split(':')
    const tamperedTag = 'ff' + tag.slice(2)
    expect(() => decryptTotpSecret(`${iv}:${enc}:${tamperedTag}`)).toThrow()
  })
})

describe('TOTP token verification', () => {
  it('accepts a valid current token', async () => {
    const { secret } = await generateTotpSecret('x@x.com')
    const totp = new TOTP({ crypto: new NobleCryptoPlugin(), base32: new ScureBase32Plugin() })
    const token = await totp.generate({ secret })
    expect(await verifyTotpToken(token, secret)).toBe(true)
  })

  it('rejects a wrong code', async () => {
    const { secret } = await generateTotpSecret('x@x.com')
    expect(await verifyTotpToken('000000', secret)).toBe(false)
    expect(await verifyTotpToken('123456', secret)).toBe(false)
  })

  it('rejects an empty string', async () => {
    const { secret } = await generateTotpSecret('x@x.com')
    // otplib throws on invalid token format; we treat that as false
    await expect(verifyTotpToken('', secret)).rejects.toThrow()
  })
})

describe('Backup codes', () => {
  it(`generates exactly ${BACKUP_CODE_COUNT} codes`, () => {
    const { plaintext, hashes } = generateBackupCodes()
    expect(plaintext).toHaveLength(BACKUP_CODE_COUNT)
    expect(hashes).toHaveLength(BACKUP_CODE_COUNT)
  })

  it('plaintext codes are uppercase hex strings', () => {
    const { plaintext } = generateBackupCodes()
    for (const code of plaintext) {
      expect(code).toMatch(/^[0-9A-F]+$/)
    }
  })

  it('hashes differ from plaintext', () => {
    const { plaintext, hashes } = generateBackupCodes()
    for (let i = 0; i < plaintext.length; i++) {
      expect(hashes[i]).not.toBe(plaintext[i])
    }
  })

  it('successfully consumes a valid backup code', () => {
    const { plaintext, hashes } = generateBackupCodes()
    const remaining = consumeBackupCode(plaintext[0], hashes)
    expect(remaining).not.toBeNull()
    expect(remaining!).toHaveLength(BACKUP_CODE_COUNT - 1)
  })

  it('backup code is single-use — second use returns null', () => {
    const { plaintext, hashes } = generateBackupCodes()
    const remaining = consumeBackupCode(plaintext[2], hashes)!
    expect(consumeBackupCode(plaintext[2], remaining)).toBeNull()
  })

  it('returns null for an invalid backup code', () => {
    const { hashes } = generateBackupCodes()
    expect(consumeBackupCode('INVALID', hashes)).toBeNull()
    expect(consumeBackupCode('00000000', hashes)).toBeNull()
  })

  it('matches case-insensitively (lowercase input)', () => {
    const { plaintext, hashes } = generateBackupCodes()
    const remaining = consumeBackupCode(plaintext[3].toLowerCase(), hashes)
    expect(remaining).not.toBeNull()
  })
})
