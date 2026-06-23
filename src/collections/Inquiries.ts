import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'name',
    group: 'Forms',
    defaultColumns: ['name', 'email', 'formType', 'isRead', 'createdAt'],
    components: {
      afterList: ['@/components/admin/InquiriesCsvButton#InquiriesCsvButton'],
    },
    hidden: ({ user }) => {
      const role = (user as { role?: string } | null)?.role
      return !role || role === 'contributor'
    },
  },
  access: {
    // Admin/editor manage; public creation is wired in a later step via API
    read: isAdminOrEditor,
    create: () => true, // public submissions allowed
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  fields: [
    {
      name: 'formType',
      type: 'select',
      required: true,
      options: [
        { label: 'Contact', value: 'contact' },
        { label: 'Join the Lab', value: 'join' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
    },
    {
      name: 'positionTitle',
      type: 'text',
      admin: {
        position: 'sidebar',
        description: 'Position applied for (join inquiries only)',
      },
    },
    {
      name: 'cv',
      type: 'upload',
      // Private collection — served via signed URLs, not public CDN.
      relationTo: 'applicant_files',
    },
    {
      name: 'sop',
      type: 'upload',
      relationTo: 'applicant_files',
      admin: { description: 'Statement of Purpose (join inquiries only)' },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'repliedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { displayFormat: 'dd MMM yyyy' },
      },
    },
  ],
  timestamps: true,
}
