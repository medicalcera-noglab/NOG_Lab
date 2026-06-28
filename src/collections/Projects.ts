import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access'
import { makeSlugHook } from '../hooks/makeSlug'
import { makeEnsureUniqueFeaturedHook } from '../hooks/ensureUniqueFeature'
import { revalidateProjects, revalidateProjectsOnDelete } from '../hooks/revalidateCache'
import { makeAuditChangeHook, makeAuditDeleteHook } from '../hooks/auditLog'

export const Projects: CollectionConfig = {
  slug: 'projects',
  admin: {
    hideAPIURL: true,
    useAsTitle: 'title',
    group: 'Research',
    defaultColumns: ['title', 'status', 'isFeaturedHome', 'updatedAt'],
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
    beforeValidate: [makeSlugHook('title')],
    beforeChange: [makeEnsureUniqueFeaturedHook('projects')],
    afterChange: [revalidateProjects, makeAuditChangeHook('projects')],
    afterDelete: [revalidateProjectsOnDelete, makeAuditDeleteHook('projects')],
  },
  fields: [
    {
      name: 'title',
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
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'ongoing',
      options: [
        { label: 'Ongoing', value: 'ongoing' },
        { label: 'Completed', value: 'completed' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'theme',
      type: 'relationship',
      relationTo: 'research_themes',
      admin: { position: 'sidebar' },
    },
    {
      name: 'summary',
      type: 'richText',
      admin: { description: 'Aim for ~150 words.' },
    },
    {
      name: 'objectives',
      type: 'array',
      fields: [
        {
          name: 'objective',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'methods',
      type: 'array',
      fields: [
        {
          name: 'method',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'funder',
      type: 'text',
    },
    {
      name: 'funderAmount',
      type: 'text',
      label: 'Funding Amount',
    },
    {
      name: 'startDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { displayFormat: 'MMM yyyy' },
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { displayFormat: 'MMM yyyy' },
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'team',
      type: 'relationship',
      relationTo: 'people',
      hasMany: true,
    },
    {
      name: 'partners',
      type: 'relationship',
      relationTo: 'collaborators',
      hasMany: true,
    },
    {
      name: 'isFeaturedHome',
      type: 'checkbox',
      defaultValue: false,
      label: 'Featured on Home Page',
      admin: {
        position: 'sidebar',
        description:
          'Only one project can be featured at a time. Checking this will unfeature all others.',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'relatedPublications',
      type: 'relationship',
      relationTo: 'publications',
      hasMany: true,
      label: 'Related Publications / Outputs',
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
