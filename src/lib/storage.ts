/**
 * Cloudflare R2 storage adapter for Payload CMS.
 *
 * Returns the s3Storage plugin configured for R2 when credentials are present.
 * Falls back to Payload's default local-disk adapter in dev so the app boots
 * without any cloud setup. A console warning is emitted in that case.
 *
 * Public/private split:
 *   media           → prefix "media/"   → served via R2_PUBLIC_URL (CDN, no auth)
 *   applicant_files → prefix "applicant-files/" → signed URLs only (15-min expiry)
 */
import { s3Storage } from '@payloadcms/storage-s3'
import type { Plugin } from 'payload'

const R2_REQUIRED_VARS = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_URL',
] as const

function hasR2Creds(): boolean {
  return R2_REQUIRED_VARS.every((v) => Boolean(process.env[v]))
}

export function buildStoragePlugin(): Plugin[] {
  if (!hasR2Creds()) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        '[NOG Lab] R2 credentials missing (%s) — falling back to local disk storage. ' +
          'Set these env vars for cloud storage.',
        R2_REQUIRED_VARS.filter((v) => !process.env[v]).join(', '),
      )
    }
    return [] // Payload default: local disk
  }

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
        region: 'auto', // R2 uses "auto" as region
        forcePathStyle: true, // required for R2
      },
      collections: {
        // Public media served via CDN (no Payload proxy, no auth check on reads).
        media: {
          prefix: 'media',
          disablePayloadAccessControl: true,
          generateFileURL: ({ filename, prefix }) => {
            const p = prefix ? `${prefix}/` : ''
            return `${publicBase}/${p}${filename}`
          },
        },
        // Private applicant files: Payload proxies the download and generates a
        // 15-minute presigned S3 URL. Collection access.read gates who can request.
        applicant_files: {
          prefix: 'applicant-files',
          signedDownloads: {
            expiresIn: 900, // 15 min
          },
        },
      },
    }),
  ]
}
