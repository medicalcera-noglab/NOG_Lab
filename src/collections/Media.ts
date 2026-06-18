import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, isAuthenticated, isOwnMediaOrAdmin } from '../access'
import { setCreatedByHook } from '../hooks/setCreatedBy'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
      'application/pdf',
    ],
  },
  admin: {
    useAsTitle: 'alt',
    group: 'Media',
    defaultColumns: ['alt', 'mimeType', 'filesize', 'createdAt'],
  },
  access: {
    read: isAuthenticated,
    create: isOwnMediaOrAdmin,
    update: isOwnMediaOrAdmin,
    delete: isAdminOrEditor,
  },
  hooks: {
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
