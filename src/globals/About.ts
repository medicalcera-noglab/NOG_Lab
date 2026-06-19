import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access'

export const About: GlobalConfig = {
  slug: 'about',
  label: 'About Page',
  admin: {
    group: 'Content',
    description:
      'Content for /about — mission, director message, KMU affiliation, facilities, testimonials.',
  },
  versions: {
    drafts: true,
    max: 20,
  },
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  fields: [
    {
      name: 'mission',
      type: 'richText',
      label: 'Mission Statement',
    },
    {
      name: 'directorMessage',
      type: 'richText',
      label: "Director's Message",
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
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          required: true,
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
