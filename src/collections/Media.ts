import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, isAuthenticated, isOwnMediaOrAdmin } from '../access'
import { setCreatedByHook } from '../hooks/setCreatedBy'
import { makeValidateMimeBytes, PUBLIC_MEDIA_MIMES } from '../hooks/validateMimeBytes'

const validateMime = makeValidateMimeBytes(PUBLIC_MEDIA_MIMES)

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
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
    read: isAuthenticated,
    create: isOwnMediaOrAdmin,
    update: isOwnMediaOrAdmin,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeOperation: [validateMime],
    beforeChange: [setCreatedByHook],
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
