import type { GlobalConfig } from 'payload'
import { isAdminOrEditor } from '../access'
import { makeGlobalRevalidateHook } from '../hooks/revalidateCache'
import { makeGlobalAuditChangeHook } from '../hooks/auditLog'

export const LegalPages: GlobalConfig = {
  slug: 'legal_pages',
  label: 'Legal Pages',
  admin: {
    hideAPIURL: true,
    group: 'Pages',
    description: 'Privacy Policy and Terms of Use — displayed at /privacy and /terms.',
    hidden: ({ user }) => {
      const role = (user as { role?: string } | null)?.role
      return !role || role === 'contributor'
    },
  },
  versions: {
    drafts: true,
    max: 10,
  },
  access: {
    read: () => true,
    update: isAdminOrEditor,
  },
  hooks: {
    afterChange: [
      makeGlobalRevalidateHook(['legal_pages']),
      makeGlobalAuditChangeHook('legal_pages'),
    ],
  },
  fields: [
    {
      name: 'privacyPolicyTitle',
      type: 'text',
      label: 'Privacy Policy — Page Title',

      defaultValue: 'Privacy Policy',
    },
    {
      name: 'privacyPolicy',
      type: 'richText',
      label: 'Privacy Policy — Body',
    },
    {
      name: 'termsOfUseTitle',
      type: 'text',
      label: 'Terms of Use — Page Title',

      defaultValue: 'Terms of Use',
    },
    {
      name: 'termsOfUse',
      type: 'richText',
      label: 'Terms of Use — Body',
    },
  ],
}
