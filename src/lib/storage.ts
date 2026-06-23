/**
 * Storage adapters for Payload CMS.
 *
 * media            → Cloudinary (25 GB free, CDN, image transformations)
 * applicant_files  → Vercel Blob (private documents, 500 MB free)
 *
 * Falls back to local disk in dev if credentials are missing.
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
  Adapter,
} from '@payloadcms/plugin-cloud-storage/types'

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
              public_id: file.filename.replace(/\.[^.]+$/, ''), // strip extension
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

  const staticHandler: import('@payloadcms/plugin-cloud-storage/types').StaticHandler = (
    _req,
    { params: { filename } },
  ) => {
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

// ── R2 config (legacy / optional) ───────────────────────────────────────────

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

// ── Main export ──────────────────────────────────────────────────────────────

let _warnedOnce = false

export function buildStoragePlugin(): Plugin[] {
  const plugins: Plugin[] = []

  // If full R2 setup exists, use it for everything (existing deployments)
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

  // Cloudinary for media (images)
  if (hasCloudinary()) {
    plugins.push(buildCloudinaryPlugin())
  }

  // Vercel Blob for applicant files (private docs)
  if (hasVercelBlob()) {
    plugins.push(
      vercelBlobStorage({
        token: process.env.BLOB_READ_WRITE_TOKEN!,
        collections: {
          // only handle applicant_files here if Cloudinary handles media
          ...(hasCloudinary() ? { applicant_files: true } : { media: true, applicant_files: true }),
        },
      }),
    )
  }

  if (plugins.length === 0 && process.env.NODE_ENV !== 'test' && !_warnedOnce) {
    _warnedOnce = true
    console.warn(
      '[NOG Lab] No cloud storage configured — using local disk. ' +
        'Set CLOUDINARY_* + BLOB_READ_WRITE_TOKEN for production.',
    )
  }

  return plugins
}
