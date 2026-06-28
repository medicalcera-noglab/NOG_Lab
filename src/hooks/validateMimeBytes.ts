/**
 * Validates the ACTUAL file content (magic bytes) using the file-type package.
 * Guards against extension spoofing — e.g. a PE/ELF binary named "photo.jpg".
 *
 * Strategy:
 *  1. If file-type detects a MIME type that is in the allowlist → accept.
 *  2. If file-type detects a MIME type NOT in the allowlist → reject.
 *  3. If file-type returns undefined (unknown format) → fall back to declared
 *     MIME type; reject if that too is not in the allowlist.
 *
 * Attach this hook to the beforeOperation array of any upload collection.
 */
import type { CollectionBeforeOperationHook } from 'payload'
import { fileTypeFromBuffer } from 'file-type'

export type MimeAllowlist = ReadonlySet<string>

export const PUBLIC_MEDIA_MIMES: MimeAllowlist = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'video/mp4',
])

export const APPLICANT_FILE_MIMES: MimeAllowlist = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

export function makeValidateMimeBytes(allowlist: MimeAllowlist): CollectionBeforeOperationHook {
  return async ({ args, operation }) => {
    if (operation !== 'create' && operation !== 'update') return args

    // `req.file` is Payload's parsed upload; only present on upload operations.
    const file = args.req?.file
    if (!file?.data || file.data.length === 0) return args

    const detected = await fileTypeFromBuffer(file.data)

    if (detected) {
      // OOXML formats (.docx, .xlsx, .pptx) are ZIP archives — file-type v22 detects
      // them as 'application/zip'. Fall through to declared MIME in that case.
      if (detected.mime !== 'application/zip') {
        if (!allowlist.has(detected.mime)) {
          throw new Error(
            `Rejected: detected file type '${detected.mime}' is not permitted. ` +
              `Allowed types: ${[...allowlist].join(', ')}.`,
          )
        }
        return args
      }
      // For ZIP-detected files, accept if the declared MIME is in the allowlist
      // (covers OOXML: .docx, .xlsx, .pptx)
      const declared = file.mimetype ?? ''
      if (!allowlist.has(declared)) {
        throw new Error(
          `Rejected: ZIP file with declared type '${declared}' is not permitted. ` +
            `Allowed types: ${[...allowlist].join(', ')}.`,
        )
      }
      return args
    }

    // file-type could not detect — fall back to declared MIME type.
    // PDFs and DOCX sometimes fail detection on small/truncated test buffers;
    // allow declared MIME through only if it's already in the allowlist.
    const declared = file.mimetype ?? ''
    if (!allowlist.has(declared)) {
      throw new Error(
        `Rejected: could not verify file content and declared type '${declared}' is not permitted.`,
      )
    }

    return args
  }
}
