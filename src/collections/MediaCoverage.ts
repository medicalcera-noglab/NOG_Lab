import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access'
import { revalidateMediaCoverage } from '../hooks/revalidateCache'
import { makeAuditChangeHook, makeAuditDeleteHook } from '../hooks/auditLog'

export const MediaCoverage: CollectionConfig = {
  slug: 'media_coverage',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
    defaultColumns: ['outlet', 'title', 'date'],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateMediaCoverage, makeAuditChangeHook('media_coverage')],
    afterDelete: [makeAuditDeleteHook('media_coverage')],
  },
  fields: [
    {
      name: 'outlet',
      type: 'text',
      required: true,
      label: 'Media Outlet / Publication',
      localized: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Article Title',
      localized: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
      label: 'Article URL',
    },
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: {
        date: { displayFormat: 'dd MMM yyyy' },
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Outlet Logo (optional)',
    },
  ],
  timestamps: true,
}
