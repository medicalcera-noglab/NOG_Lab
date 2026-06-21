import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access'
import { makeGlobalRevalidateHook } from '../hooks/revalidateCache'
import { makeGlobalAuditChangeHook } from '../hooks/auditLog'

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: 'Navigation',
  admin: {
    group: 'Site Config',
    description:
      'Header navigation links and footer link groups. Changes take effect on the next page view.',
    hidden: ({ user }) => {
      const role = (user as { role?: string } | null)?.role
      return !role || role === 'contributor'
    },
  },
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  hooks: {
    afterChange: [
      makeGlobalRevalidateHook(['navigation']),
      makeGlobalAuditChangeHook('navigation'),
    ],
  },
  fields: [
    {
      name: 'headerLinks',
      type: 'array',
      label: 'Header Navigation Links',
      admin: { description: 'Ordered list of links shown in the top nav and mobile menu.' },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'href',
          type: 'text',
          required: true,
          label: 'Path or URL',
          admin: { description: 'Use /path for internal pages, https://… for external.' },
        },
        {
          name: 'isExternal',
          type: 'checkbox',
          label: 'Opens in new tab',
          defaultValue: false,
        },
        {
          name: 'isVisible',
          type: 'checkbox',
          label: 'Visible',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'footerGroups',
      type: 'array',
      label: 'Footer Link Groups',
      admin: { description: 'Each group appears as a labelled column in the footer.' },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'links',
          type: 'array',
          label: 'Links',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'href',
              type: 'text',
              required: true,
            },
            {
              name: 'isExternal',
              type: 'checkbox',
              defaultValue: false,
              label: 'Opens in new tab',
            },
          ],
        },
      ],
    },
  ],
}
