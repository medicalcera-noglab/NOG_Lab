import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    useAsTitle: 'name',
    group: 'Forms',
    description:
      'All contact messages and Join the Lab applications. Click any row to read the full message.',
    defaultColumns: ['formType', 'name', 'email', 'message', 'isRead', 'createdAt'],
    listSearchableFields: ['name', 'email', 'message'],
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
        description: 'Position applied for',
        condition: (data) => data?.formType === 'join',
      },
    },
    {
      name: 'cv',
      type: 'upload',
      relationTo: 'applicant_files',
      admin: {
        description: 'CV / Resume uploaded by the applicant',
        condition: (data) => data?.formType === 'join',
      },
    },
    {
      name: 'sop',
      type: 'upload',
      relationTo: 'applicant_files',
      admin: {
        description: 'Statement of Purpose uploaded by the applicant',
        condition: (data) => data?.formType === 'join',
      },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      label: 'Marked as Read',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Tick this once you have read and actioned this message.',
      },
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
