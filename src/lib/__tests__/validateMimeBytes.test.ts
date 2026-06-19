import { describe, it, expect } from 'vitest'
import {
  makeValidateMimeBytes,
  PUBLIC_MEDIA_MIMES,
  APPLICANT_FILE_MIMES,
} from '../../hooks/validateMimeBytes'
import type { CollectionBeforeOperationHook } from 'payload'

// ── Magic byte helpers ──────────────────────────────────────────────────────

/** JFIF/JPEG: FF D8 FF */
function jpegBuffer(len = 64): Buffer {
  const b = Buffer.alloc(len)
  b[0] = 0xff
  b[1] = 0xd8
  b[2] = 0xff
  return b
}

/** PNG: 89 50 4E 47 0D 0A 1A 0A */
function pngBuffer(len = 64): Buffer {
  const b = Buffer.alloc(len)
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b)
  return b
}

/** PDF: %PDF- */
function pdfBuffer(len = 64): Buffer {
  const b = Buffer.alloc(len)
  Buffer.from('%PDF-').copy(b)
  return b
}

/** Windows PE executable: MZ */
function exeBuffer(len = 64): Buffer {
  const b = Buffer.alloc(len)
  b[0] = 0x4d
  b[1] = 0x5a // 'MZ'
  return b
}

/** ELF (Linux binary): 7F 45 4C 46 */
function elfBuffer(len = 64): Buffer {
  const b = Buffer.alloc(len)
  b[0] = 0x7f
  b[1] = 0x45
  b[2] = 0x4c
  b[3] = 0x46 // '\x7fELF'
  return b
}

/** WebP: RIFF....WEBP */
function webpBuffer(): Buffer {
  const b = Buffer.alloc(12)
  Buffer.from('RIFF').copy(b, 0)
  Buffer.alloc(4).copy(b, 4) // file size (irrelevant for detection)
  Buffer.from('WEBP').copy(b, 8)
  return b
}

// ── Helpers to build fake PayloadRequest-like args ─────────────────────────

function makeArgs(fileData: Buffer, mimetype: string, operation: string = 'create') {
  return {
    args: {
      req: { file: { data: fileData, mimetype, name: 'test-file', size: fileData.length } },
    },
    operation,
  } as unknown as Parameters<CollectionBeforeOperationHook>[0]
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('makeValidateMimeBytes — public media allowlist', () => {
  const hook = makeValidateMimeBytes(PUBLIC_MEDIA_MIMES)

  it('accepts a valid JPEG', async () => {
    const args = makeArgs(jpegBuffer(), 'image/jpeg')
    await expect(hook(args)).resolves.not.toThrow()
  })

  it('accepts a valid PNG', async () => {
    await expect(hook(makeArgs(pngBuffer(), 'image/png'))).resolves.not.toThrow()
  })

  it('accepts a valid WebP', async () => {
    await expect(hook(makeArgs(webpBuffer(), 'image/webp'))).resolves.not.toThrow()
  })

  it('accepts a valid PDF', async () => {
    await expect(hook(makeArgs(pdfBuffer(), 'application/pdf'))).resolves.not.toThrow()
  })

  it('rejects a Windows PE binary renamed to .jpg', async () => {
    const args = makeArgs(exeBuffer(), 'image/jpeg')
    await expect(hook(args)).rejects.toThrow(/Rejected/)
    await expect(hook(args)).rejects.toThrow(/application\/x-msdownload|application\/octet-stream/)
  })

  it('rejects an ELF binary renamed to .png', async () => {
    const args = makeArgs(elfBuffer(), 'image/png')
    await expect(hook(args)).rejects.toThrow(/Rejected/)
  })

  it('rejects a file with declared type not in allowlist even if undetected', async () => {
    // Empty / all-zeros buffer — file-type returns undefined.
    // Declared type is 'application/zip' which is not in the allowlist.
    const args = makeArgs(Buffer.alloc(64), 'application/zip')
    await expect(hook(args)).rejects.toThrow(/Rejected/)
  })

  it('passes through non-upload operations without checking', async () => {
    const args = makeArgs(exeBuffer(), 'image/jpeg', 'read')
    await expect(hook(args)).resolves.not.toThrow()
  })

  it('passes through when req.file is absent', async () => {
    const args = {
      args: { req: {} },
      operation: 'create',
    } as unknown as Parameters<CollectionBeforeOperationHook>[0]
    await expect(hook(args)).resolves.not.toThrow()
  })
})

describe('makeValidateMimeBytes — applicant files allowlist', () => {
  const hook = makeValidateMimeBytes(APPLICANT_FILE_MIMES)

  it('accepts a PDF', async () => {
    await expect(hook(makeArgs(pdfBuffer(), 'application/pdf'))).resolves.not.toThrow()
  })

  it('rejects an image (JPEG) — images are not in the applicant allowlist', async () => {
    await expect(hook(makeArgs(jpegBuffer(), 'image/jpeg'))).rejects.toThrow(/Rejected/)
  })

  it('rejects a PE binary renamed to .pdf', async () => {
    await expect(hook(makeArgs(exeBuffer(), 'application/pdf'))).rejects.toThrow(/Rejected/)
  })
})
