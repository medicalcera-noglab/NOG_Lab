/**
 * Storage adapters for Payload CMS.
 *
 * Priority (first match wins):
 *   1. R2 (Cloudflare)   — set all 5 R2_* vars           → covers media + applicant_files
 *   2. Cloudinary         — set CLOUDINARY_* vars          → covers media only
 *   3. Vercel Blob        — set BLOB_READ_WRITE_TOKEN      → covers media + applicant_files
 *   4. Local disk         — no cloud vars (dev only; not writable on Vercel serverless)
 *
 * On Vercel without any cloud storage configured, uploads fail because the
 * serverless filesystem is read-only.  Create a Vercel Blob store in the
 * dashboard (Storage → Connect Store) and the BLOB_READ_WRITE_TOKEN env var
 * is added automatically.
 */
import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { v2 as cloudinary } from 'cloudinary'
import type { Plugin } from 'payload'
import type {
  HandleUpload,
  HandleDelete,
  GenerateURL,
  StaticHandler,
  Adapter,
} from '@payloadcms/plugin-cloud-storage/types'

// ── R2 config ────────────────────────────────────────────────────────────────

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

// ── Cloudinary config ────────────────────────────────────────────────────────

function hasCloudinary(): boolean {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET,
  )
}

function buildCloudinaryPlugin(): Plugin {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  })

  const handleUpload: HandleUpload = async ({ data, file }) => {
    const buffer = file.buffer
    const result = await new Promise<{ public_id: string; secure_url: string }>(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'nog-lab/media',
              public_id: file.filename.replace(/\.[^.]+$/, ''),
              overwrite: true,
              resource_type: 'auto',
            },
            (err, result) => {
              if (err || !result) reject(err)
              else resolve(result as { public_id: string; secure_url: string })
            },
          )
          .end(buffer)
      },
    )
    data.filename = result.public_id.split('/').pop() ?? file.filename
    return data
  }

  const handleDelete: HandleDelete = async ({ doc }) => {
    const publicId = `nog-lab/media/${doc.filename}`
    await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' }).catch(() => {})
  }

  const generateURL: GenerateURL = ({ filename }) => {
    return cloudinary.url(`nog-lab/media/${filename}`, {
      secure: true,
      fetch_format: 'auto',
      quality: 'auto',
    })
  }

  const staticHandler: StaticHandler = (_req, { params: { filename } }) => {
    const url = cloudinary.url(`nog-lab/media/${filename}`, { secure: true })
    return Response.redirect(url)
  }

  const adapter: Adapter = () => ({
    name: 'cloudinary',
    handleUpload,
    handleDelete,
    generateURL,
    staticHandler,
  })

  return cloudStoragePlugin({
    collections: {
      media: {
        adapter,
        disablePayloadAccessControl: true,
        disableLocalStorage: true,
      },
    },
  })
}

// ── Vercel Blob config ───────────────────────────────────────────────────────

function hasVercelBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

/**
 * Vercel Blob for both media and applicant_files.
 * The official @payloadcms/storage-vercel-blob package disables itself when
 * BLOB_READ_WRITE_TOKEN is missing, so it's safe to always add this plugin.
 * Files are stored with `access: 'public'` (Vercel Blob hobby plan only).
 */
function buildVercelBlobPlugin(token: string): Plugin {
  return vercelBlobStorage({
    token,
    collections: {
      media: {
        prefix: 'media',
      },
      applicant_files: {
        prefix: 'applicant-files',
      },
    },
    access: 'public',
    addRandomSuffix: false,
    cacheControlMaxAge: 60 * 60 * 24 * 365, // 1 year
  })
}

// ── Main export ──────────────────────────────────────────────────────────────

let _warnedOnce = false

export function buildStoragePlugin(): Plugin[] {
  const plugins: Plugin[] = []

  // Priority 1: R2 — handles both collections
  if (hasR2()) {
    const endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
    const publicBase = (process.env.R2_PUBLIC_URL ?? '').replace(/\/$/, '')
    plugins.push(
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
            generateFileURL: ({ filename, prefix }) =>
              `${publicBase}/${prefix ? `${prefix}/` : ''}${filename}`,
          },
          applicant_files: {
            prefix: 'applicant-files',
            signedDownloads: { expiresIn: 900 },
          },
        },
      }),
    )
    return plugins
  }

  // Priority 2: Cloudinary — handles media only
  if (hasCloudinary()) {
    plugins.push(buildCloudinaryPlugin())
  }

  // Priority 3: Vercel Blob — handles media (when Cloudinary absent) + applicant_files
  if (hasVercelBlob()) {
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN!
    try {
      plugins.push(buildVercelBlobPlugin(blobToken))
    } catch (err) {
      console.error('[NOG Lab] Vercel Blob plugin failed to init:', err)
    }
  }

  if (plugins.length === 0 && process.env.NODE_ENV !== 'test' && !_warnedOnce) {
    _warnedOnce = true
    console.warn(
      '[NOG Lab] No cloud storage configured — media uploads use local disk.\n' +
        '  On Vercel this will fail. To fix:\n' +
        '  1. Go to Vercel dashboard → Storage → Create a Blob store\n' +
        '     (BLOB_READ_WRITE_TOKEN is added to your project automatically)\n' +
        '  OR set CLOUDINARY_CLOUD_NAME + CLOUDINARY_API_KEY + CLOUDINARY_API_SECRET\n' +
        '  OR set all R2_* variables for Cloudflare R2.',
    )
  }

  return plugins
}
