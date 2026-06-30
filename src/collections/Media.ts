import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload'
import { isAdminOrEditor, isOwnMediaOrAdmin } from '../access'
import { setCreatedByHook } from '../hooks/setCreatedBy'
import { makeValidateMimeBytes, PUBLIC_MEDIA_MIMES } from '../hooks/validateMimeBytes'

// When alt text is not provided (e.g. drag-drop upload in admin), auto-derive it
// from the filename so the required validation doesn't block the upload.
const autoPopulateAlt: CollectionBeforeChangeHook = ({ data }) => {
  if (!data.alt && data.filename) {
    const basename = String(data.filename)
      .replace(/\.[^.]+$/, '') // strip extension
      .replace(/[-_]/g, ' ') // dashes/underscores → spaces
      .replace(/\s+/g, ' ')
      .trim()
    if (basename) data.alt = basename
  }
  return data
}

const validateMime = makeValidateMimeBytes(PUBLIC_MEDIA_MIMES)
const dirname = path.dirname(fileURLToPath(import.meta.url))

// Rewrite Payload's default /api/media/file/[fn] URLs to /media/[fn] so files
// are served by Next.js static file serving from public/media/ on all hosts.
function rewriteMediaUrl(url: string | null | undefined): string | null | undefined {
  if (!url) return url
  if (url.startsWith('/api/media/file/')) {
    return url.replace('/api/media/file/', '/media/')
  }
  return url
}

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
    mimeTypes: [...PUBLIC_MEDIA_MIMES],
    // Use a function so the URL points to /media/ (static files in public/).
    // The default string form builds /api/media/file/... which returns 404 because
    // files are served statically by Next.js from public/media/, not via Payload's API.
    adminThumbnail: ({ doc }) => {
      const sizes = (doc as Record<string, unknown>).sizes as
        | Record<string, { filename?: string }>
        | undefined
      const thumbFilename = sizes?.thumbnail?.filename
      if (thumbFilename) return `/media/${encodeURIComponent(thumbFilename)}`
      const filename = (doc as Record<string, unknown>).filename as string | undefined
      return filename ? `/media/${encodeURIComponent(filename)}` : null
    },
    // Sharp generates WebP derivatives at upload time.
    // Non-image types (PDF, MP4) skip resize; Sharp won't process them.
    imageSizes: [
      {
        name: 'thumbnail',
        width: 300,
        // height undefined → proportional crop
        formatOptions: { format: 'webp', options: { quality: 82 } },
        withoutEnlargement: true,
      },
      {
        name: 'medium',
        width: 800,
        formatOptions: { format: 'webp', options: { quality: 85 } },
        withoutEnlargement: true,
      },
      {
        name: 'large',
        width: 1600,
        formatOptions: { format: 'webp', options: { quality: 88 } },
        withoutEnlargement: true,
      },
    ],
  },
  admin: {
    hideAPIURL: true,
    useAsTitle: 'alt',
    group: 'Media',
    defaultColumns: ['alt', 'mimeType', 'filesize', 'createdAt'],
  },
  access: {
    // Public CDN handles unauthenticated reads; auth only needed for admin UI.
    read: () => true,
    create: isOwnMediaOrAdmin,
    update: isOwnMediaOrAdmin,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeOperation: [validateMime],
    beforeChange: [autoPopulateAlt, setCreatedByHook],
    afterRead: [
      ({ doc }) => {
        doc.url = rewriteMediaUrl(doc.url)
        if (doc.sizes && typeof doc.sizes === 'object') {
          for (const key of Object.keys(doc.sizes)) {
            const s = doc.sizes[key as keyof typeof doc.sizes] as { url?: string } | undefined
            if (s) s.url = rewriteMediaUrl(s.url) ?? s.url
          }
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Describe the image for screen readers and search engines. Auto-filled from filename if left blank — please update it with a meaningful description.',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'sourceUrl',
      type: 'text',
      label: 'Source URL',
      admin: {
        position: 'sidebar',
        description: 'Original URL where this image was obtained.',
      },
    },
    {
      name: 'sourceAuthor',
      type: 'text',
      label: 'Photographer / Author',
      admin: {
        position: 'sidebar',
        description: 'Attribution for the creator.',
      },
    },
    {
      name: 'sourceLicense',
      type: 'text',
      label: 'License',
      admin: {
        position: 'sidebar',
        description: 'License for this image, e.g. CC BY 4.0 or Unsplash License.',
      },
    },
    {
      name: 'isDemo',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        hidden: true,
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
        condition: (_, siblingData) => Boolean(siblingData?.id),
      },
    },
  ],
}
