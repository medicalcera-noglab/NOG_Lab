/**
 * Storage adapter for Payload CMS.
 *
 * Priority:
 *   1. Cloudflare R2  — if all R2_* env vars are set
 *   2. Vercel Blob    — if BLOB_READ_WRITE_TOKEN is set (free, no card needed)
 *   3. Local disk     — dev fallback (files lost on Vercel redeploy)
 */
import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import type { Plugin } from 'payload'

const R2_VARS = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_URL',
] as const

function hasR2(): boolean {
  return R2_VARS.every((v) => Boolean(process.env[v]))
}

function hasVercelBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

let _warnedOnce = false

export function buildStoragePlugin(): Plugin[] {
  // ── Cloudflare R2 ──────────────────────────────────────────────────────────
  if (hasR2()) {
    const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    const publicBase = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')

    return [
      s3Storage({
        bucket: process.env.R2_BUCKET!,
        config: {
          endpoint,
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
          },
          region: 'auto',
          forcePathStyle: true,
        },
        collections: {
          media: {
            prefix: 'media',
            disablePayloadAccessControl: true,
            generateFileURL: ({ filename, prefix }) => {
              const p = prefix ? `${prefix}/` : ''
              return `${publicBase}/${p}${filename}`
            },
          },
          applicant_files: {
            prefix: 'applicant-files',
            signedDownloads: { expiresIn: 900 },
          },
        },
      }),
    ]
  }

  // ── Vercel Blob ────────────────────────────────────────────────────────────
  if (hasVercelBlob()) {
    return [
      vercelBlobStorage({
        token: process.env.BLOB_READ_WRITE_TOKEN!,
        collections: {
          media: true,
          applicant_files: true,
        },
      }),
    ]
  }

  // ── Local disk fallback (dev only) ─────────────────────────────────────────
  if (process.env.NODE_ENV !== 'test' && !_warnedOnce) {
    _warnedOnce = true
    console.warn(
      '[NOG Lab] No cloud storage configured — falling back to local disk. ' +
        'Set BLOB_READ_WRITE_TOKEN (Vercel Blob) or R2_* vars for production.',
    )
  }
  return []
}
