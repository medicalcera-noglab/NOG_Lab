/**
 * Private upload collection for CV and Statement of Purpose files submitted
 * via the "Join the Lab" inquiry form.
 *
 * Privacy guarantees:
 *  - access.read is restricted to super_admin and editor only.
 *  - When R2 is configured, the storage-s3 plugin serves files via short-lived
 *    presigned S3 URLs (15 min expiry) rather than a public CDN URL.
 *  - No image sizes are generated (PDFs/DOCX only).
 *  - These files are NOT served from R2_PUBLIC_URL.
 */
import type { CollectionConfig } from 'payload'
import { isAdminOrEditor, isSuperAdmin } from '../access'
import { makeValidateMimeBytes, APPLICANT_FILE_MIMES } from '../hooks/validateMimeBytes'

const validateMime = makeValidateMimeBytes(APPLICANT_FILE_MIMES)

export const ApplicantFiles: CollectionConfig = {
  slug: 'applicant_files',
  upload: {
    mimeTypes: [...APPLICANT_FILE_MIMES],
    // No imageSizes — PDFs and DOCX are never resized.
  },
  admin: {
    useAsTitle: 'filename',
    group: 'Forms',
    defaultColumns: ['filename', 'mimeType', 'filesize', 'createdAt'],
    hidden: ({ user }) => {
      const role = (user as { role?: string } | null)?.role
      return role !== 'super_admin' && role !== 'editor'
    },
  },
  access: {
    read: isAdminOrEditor,
    create: () => true, // public upload via inquiry form
    update: isSuperAdmin,
    delete: isAdminOrEditor,
  },
  hooks: {
    beforeOperation: [validateMime],
  },
  fields: [
    // Minimal metadata — the important fields (url, filename, mimeType, filesize)
    // are managed automatically by Payload's upload machinery.
    {
      name: 'submittedBy',
      type: 'email',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: "Applicant's email address (from the inquiry form)",
      },
    },
  ],
}
