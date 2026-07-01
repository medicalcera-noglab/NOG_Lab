/**
 * Storage adapters for Payload CMS.
 *
 * Priority (first match wins):
 *   1. R2 (Cloudflare)  — set all 5 R2_* vars          → media + applicant_files
 *   2. Cloudinary        — set CLOUDINARY_* vars         → media only
 *   3. Vercel Blob       — set BLOB_READ_WRITE_TOKEN     → media + applicant_files
 *   4. Local disk        — dev-only; not writable on Vercel serverless
 *
 * Cloudinary setup (recommended):
 *   CLOUDINARY_CLOUD_NAME=your-cloud-name
 *   CLOUDINARY_API_KEY=your-api-key
 *   CLOUDINARY_API_SECRET=your-api-secret
 *   Add these to Vercel → Settings → Environment Variables.
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

/** Strip file extension to get the Cloudinary public_id segment. */
function toPublicId(filename: string): string {
  return filename.replace(/\.[^.]+$/, '')
}

function buildCloudinaryPlugin(): Plugin {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
    api_key: process.env.CLOUDINARY_API_KEY!,
    api_secret: process.env.CLOUDINARY_API_SECRET!,
  })

  // handleUpload is called once per file (original + each image size variant).
  // We upload each file to Cloudinary and return nothing — URL generation is
  // handled by generateURL via the beforeChange hooks injected by the plugin.
  // Do NOT modify data.filename here: it corrupts the main filename when called
  // for size variants (the calls run in parallel via Promise.all).
  const handleUpload: HandleUpload = async ({ file }) => {
    const publicId = `nog-lab/media/${toPublicId(file.filename)}`
    await new Promise<void>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { public_id: publicId, overwrite: true, resource_type: 'auto' },
          (err, result) => {
            if (err || !result) reject(err ?? new Error('Cloudinary upload failed'))
            else resolve()
          },
        )
        .end(file.buffer)
    })
    // Return undefined — filtered out of uploadMetadata, no unnecessary payload.update()
  }

  // handleDelete is called for each file being removed (original + size variants).
  const handleDelete: HandleDelete = async ({ filename }) => {
    const publicId = `nog-lab/media/${toPublicId(filename)}`
    await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' }).catch(() => {})
  }

  // generateURL is called by the beforeChange hook on the url field (and each size
  // variant url field) to build the CDN URL that gets stored in the database.
  // filename in the DB always includes the extension (e.g. photo.jpg, photo-300x200.webp)
  // so we strip it before building the Cloudinary public_id.
  const generateURL: GenerateURL = ({ filename }) => {
    const publicId = `nog-lab/media/${toPublicId(filename)}`
    return cloudinary.url(publicId, {
      secure: true,
      fetch_format: 'auto',
      quality: 'auto',
    })
  }

  // staticHandler is a fallback redirect — only reached when
  // disablePayloadAccessControl is false (not our case) or via clientUploadContext.
  const staticHandler: StaticHandler = (_req, { params: { filename } }) => {
    const publicId = `nog-lab/media/${toPublicId(filename)}`
    return Response.redirect(cloudinary.url(publicId, { secure: true }))
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
        // Direct Cloudinary URLs in DB — no Payload access-control proxy
        disablePayloadAccessControl: true,
        // Files live in Cloudinary, not on local disk
        disableLocalStorage: true,
      },
    },
  })
}

// ── Vercel Blob config (fallback when Cloudinary absent) ─────────────────────

function hasVercelBlob(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

function buildVercelBlobPlugin(token: string): Plugin {
  return vercelBlobStorage({
    token,
    collections: {
      media: { prefix: 'media' },
      applicant_files: { prefix: 'applicant-files' },
    },
    access: 'public',
    addRandomSuffix: false,
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  })
}

// ── Main export ──────────────────────────────────────────────────────────────

let _warnedOnce = false

export function buildStoragePlugin(): Plugin[] {
  const plugins: Plugin[] = []

  // Priority 1: R2 — covers both collections
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

  // Priority 2: Cloudinary — covers media
  if (hasCloudinary()) {
    plugins.push(buildCloudinaryPlugin())
  }

  // Priority 3: Vercel Blob — covers media (when Cloudinary absent) + applicant_files
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
        '  On Vercel this fails. Add to Vercel → Settings → Environment Variables:\n' +
        '    CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET',
    )
  }

  return plugins
}
