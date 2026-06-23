import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access'
import { makeSlugHook } from '../hooks/makeSlug'
import { revalidatePeople, revalidatePeopleOnDelete } from '../hooks/revalidateCache'
import { makeAuditChangeHook, makeAuditDeleteHook } from '../hooks/auditLog'

export const People: CollectionConfig = {
  slug: 'people',
  admin: {
    useAsTitle: 'name',
    group: 'Team',
    defaultColumns: ['name', 'role', 'displayOrder', 'is_active'],
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
    beforeValidate: [makeSlugHook('name')],
    afterChange: [revalidatePeople, makeAuditChangeHook('people')],
    afterDelete: [revalidatePeopleOnDelete, makeAuditDeleteHook('people')],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      options: [
        { label: 'Principal Investigator', value: 'pi' },
        { label: 'Postdoctoral Researcher', value: 'postdoc' },
        { label: 'PhD Student', value: 'phd' },
        { label: 'MS Student', value: 'ms' },
        { label: 'Staff', value: 'staff' },
        { label: 'Alumni', value: 'alumni' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'bio',
      type: 'richText',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'email',
      type: 'email',
    },
    {
      name: 'orcid',
      type: 'text',
      admin: { description: 'ORCID identifier, e.g. 0000-0002-1825-0097' },
    },
    {
      name: 'googleScholar',
      type: 'text',
      label: 'Google Scholar URL',
    },
    {
      name: 'linkedin',
      type: 'text',
      label: 'LinkedIn URL',
    },
    {
      name: 'researchgate',
      type: 'text',
      label: 'ResearchGate URL',
    },
    {
      name: 'interests',
      type: 'array',
      label: 'Research Interests',
      fields: [
        {
          name: 'interest',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'joinedDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { displayFormat: 'MMM yyyy' },
      },
    },
    {
      name: 'leftDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { displayFormat: 'MMM yyyy' },
        description: 'Set this to mark the person as alumni on the public site.',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 0,
      admin: { position: 'sidebar' },
    },
    {
      name: 'is_active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Uncheck to soft-hide from the public site.',
      },
    },
    {
      name: 'isDemo',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Demo content — remove with npm run seed:clear-demo.',
      },
    },
  ],
}
