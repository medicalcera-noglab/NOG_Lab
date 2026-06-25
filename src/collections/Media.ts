import path from 'path'
import { fileURLToPath } from 'url'
import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, isOwnMediaOrAdmin } from '../access'
import { setCreatedByHook } from '../hooks/setCreatedBy'
import { makeValidateMimeBytes, PUBLIC_MEDIA_MIMES } from '../hooks/validateMimeBytes'

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
    adminThumbnail: 'thumbnail',
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
    beforeChange: [setCreatedByHook],
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
        description: 'Required: describe the image for screen readers and search engines.',
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
        position: 'sidebar',
        description: 'Demo image — remove with npm run seed:clear-demo-media.',
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
