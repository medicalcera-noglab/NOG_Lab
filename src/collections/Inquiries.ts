import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access'

export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  admin: {
    hideAPIURL: true,
    useAsTitle: 'name',
    group: 'Forms',
    description:
      'Contact messages and Join the Lab applications. Use the tabs above to filter by type. Opening a message marks it as read automatically.',
    defaultColumns: ['formType', 'name', 'email', 'message', 'isRead', 'createdAt'],
    listSearchableFields: ['name', 'email', 'message'],
    components: {
      beforeList: ['@/components/admin/InquiriesFilterTabs#InquiriesFilterTabs'],
      afterList: ['@/components/admin/InquiriesCsvButton#InquiriesCsvButton'],
    },
    hidden: ({ user }) => {
      const role = (user as { role?: string } | null)?.role
      return !role || role === 'contributor'
    },
  },
  access: {
    read: isAdminOrEditor,
    create: () => true,
    update: isAdminOrEditor,
    delete: isAdminOrEditor,
  },
  hooks: {
    afterRead: [
      // Auto-mark as read when an admin opens a single inquiry (not when listing)
      async ({ doc, req, findMany }) => {
        if (!findMany && req.user && !doc.isRead) {
          try {
            await req.payload.update({
              collection: 'inquiries',
              id: doc.id,
              data: { isRead: true },
              req,
              overrideAccess: true,
            })
            doc.isRead = true
          } catch {
            // non-fatal — don't break the read if the update fails
          }
        }
        return doc
      },
    ],
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
      admin: {
        components: {
          Cell: '@/components/admin/InquiryNameCell#InquiryNameCell',
        },
      },
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
      label: 'Position Applied For',
      admin: {
        position: 'sidebar',
        condition: (data) => data?.formType === 'join',
      },
    },
    {
      name: 'cvFilename',
      type: 'text',
      label: 'CV / Resume — Original Filename',
      admin: {
        description: 'Filename submitted by the applicant (always stored, even if upload failed).',
        condition: (data) => data?.formType === 'join',
        readOnly: true,
      },
    },
    {
      name: 'cvUrl',
      type: 'text',
      label: 'CV / Resume — Download',
      admin: {
        description: 'Direct Vercel Blob URL. Click to download the file.',
        condition: (data) => data?.formType === 'join',
        readOnly: true,
        components: {
          Field: '@/components/admin/DownloadFileField#DownloadFileField',
        },
      },
    },
    {
      name: 'sopFilename',
      type: 'text',
      label: 'Statement of Purpose — Original Filename',
      admin: {
        description: 'Filename submitted by the applicant (always stored, even if upload failed).',
        condition: (data) => data?.formType === 'join',
        readOnly: true,
      },
    },
    {
      name: 'sopUrl',
      type: 'text',
      label: 'Statement of Purpose — Download',
      admin: {
        description: 'Direct Vercel Blob URL. Click to download the file.',
        condition: (data) => data?.formType === 'join',
        readOnly: true,
        components: {
          Field: '@/components/admin/DownloadFileField#DownloadFileField',
        },
      },
    },
    {
      name: 'replyText',
      type: 'textarea',
      label: 'Reply / Response',
      admin: {
        description:
          'Write your reply here. Save first, then click "Generate Reply Letter" to download the A4 PDF.',
        condition: (data) => data?.formType === 'join',
        rows: 8,
      },
    },
    {
      name: 'replyLetterButton',
      type: 'ui',
      admin: {
        condition: (data) => data?.formType === 'join',
        components: {
          Field: '@/components/admin/ReplyLetterButton#ReplyLetterButton',
        },
      },
    },
    {
      name: 'isRead',
      type: 'checkbox',
      label: 'Marked as Read',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Auto-set when you open the message. Uncheck to flag as unread again.',
      },
    },
    {
      name: 'repliedAt',
      type: 'date',
      label: 'Replied At',
      admin: {
        position: 'sidebar',
        date: { displayFormat: 'dd MMM yyyy' },
      },
    },
  ],
  timestamps: true,
}
