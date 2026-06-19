import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, isAuthenticated } from '../access'
import { revalidateCollaborators } from '../hooks/revalidateCache'

export const Collaborators: CollectionConfig = {
  slug: 'collaborators',
  admin: {
    useAsTitle: 'name',
    group: 'Lab',
    defaultColumns: ['name', 'type', 'country', 'displayOrder'],
  },
  access: {
    read: isAuthenticated,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateCollaborators],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Academic', value: 'academic' },
        { label: 'Industry', value: 'industry' },
        { label: 'Government', value: 'government' },
      ],
    },
    {
      name: 'country',
      type: 'text',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'website',
      type: 'text',
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
  ],
}
