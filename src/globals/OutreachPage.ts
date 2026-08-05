import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access'
import { revalidateOutreachPage } from '../hooks/revalidateCache'
import { makeGlobalAuditChangeHook } from '../hooks/auditLog'

export const OutreachPage: GlobalConfig = {
  slug: 'outreach_page',
  label: 'Outreach Page',
  admin: {
    hideAPIURL: true,
    group: 'Pages',
    description: 'Content for /outreach — introductory text and section heading.',
    hidden: ({ user }) => {
      const role = (user as { role?: string } | null)?.role
      return !role || role === 'contributor'
    },
  },
  versions: { drafts: true, max: 20 },
  access: { read: () => true, update: isAdminOrEditor },
  hooks: {
    afterChange: [revalidateOutreachPage, makeGlobalAuditChangeHook('outreach_page')],
  },
  fields: [
    {
      name: 'introText',
      type: 'richText',
      label: 'Introduction Text',
      admin: { description: 'Introductory paragraph displayed at the top of the Outreach page.' },
    },
    {
      name: 'sectionTitle',
      type: 'text',
      label: 'Section Title',
      defaultValue: 'Community Outreach and Engagement Activities',
      admin: { description: 'Heading above the activity list.' },
    },
  ],
}
