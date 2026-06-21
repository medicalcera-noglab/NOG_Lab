import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access'
import { revalidateAbout } from '../hooks/revalidateCache'
import { makeGlobalAuditChangeHook } from '../hooks/auditLog'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About Page',
  admin: {
    group: 'Pages',
    description:
      'Content for /about — mission, director message, KMU affiliation, facilities, testimonials.',
    hidden: ({ user }) => {
      const role = (user as { role?: string } | null)?.role
      return !role || role === 'contributor'
    },
  },
  versions: {
    drafts: true,
    max: 20,
  },
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  hooks: {
    afterChange: [revalidateAbout, makeGlobalAuditChangeHook('about')],
  },
  fields: [
    {
      name: 'mission',
      type: 'richText',
      label: 'Mission Statement',
      localized: true,
    },
    {
      name: 'directorMessage',
      type: 'richText',
      label: "Director's Message",
      localized: true,
    },
    {
      name: 'directorPortrait',
      type: 'upload',
      relationTo: 'media',
      label: "Director's Portrait",
    },
    {
      name: 'kmuAffiliation',
      type: 'richText',
      label: 'KMU Affiliation Block',
      localized: true,
    },
    {
      name: 'facilities',
      type: 'array',
      label: 'Facilities Gallery',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          localized: true,
        },
      ],
    },
    {
      name: 'testimonials',
      type: 'array',
      label: 'Testimonials',
      fields: [
        {
          name: 'quote',
          type: 'textarea',
          required: true,
          localized: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'role',
          type: 'text',
          required: true,
          localized: true,
        },
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
