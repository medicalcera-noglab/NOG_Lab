import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access'
import { revalidateCollaborators, revalidateCollaboratorsOnDelete } from '../hooks/revalidateCache'
import { makeAuditChangeHook, makeAuditDeleteHook } from '../hooks/auditLog'

export const Collaborators: CollectionConfig = {
  slug: 'collaborators',
  admin: {
    hideAPIURL: true,
    useAsTitle: 'name',
    group: 'Team',
    defaultColumns: ['name', 'type', 'country', 'displayOrder'],
    hidden: ({ user }) => {
      const role = (user as { role?: string } | null)?.role
      return !role || role === 'contributor'
    },
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateCollaborators, makeAuditChangeHook('collaborators')],
    afterDelete: [revalidateCollaboratorsOnDelete, makeAuditDeleteHook('collaborators')],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
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
    {
      name: 'isDemo',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        hidden: true,
      },
    },
  ],
}
