import type { CollectionConfig } from 'payload'
import { isAdminOrEditor } from '../access'
import { revalidateStudySites } from '../hooks/revalidateCache'
import { makeAuditChangeHook, makeAuditDeleteHook } from '../hooks/auditLog'

export const StudySites: CollectionConfig = {
  slug: 'study_sites',
  labels: { singular: 'Study Site', plural: 'Study Sites' },
  admin: {
    useAsTitle: 'name',
    group: 'Research',
    defaultColumns: ['name', 'district', 'province', 'project'],
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
    afterChange: [revalidateStudySites, makeAuditChangeHook('study_sites')],
    afterDelete: [makeAuditDeleteHook('study_sites')],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'district',
      type: 'text',
      required: true,
    },
    {
      name: 'province',
      type: 'text',
      required: true,
    },
    {
      name: 'project',
      type: 'relationship',
      relationTo: 'projects',
      required: true,
      admin: { position: 'sidebar' },
    },
    /**
     * Payload's `point` field creates a geometry(Point) column (PostGIS).
     * A separate migration converts this to geography(Point,4326) and adds
     * a GiST index. The read/write format (EWKB) remains compatible.
     *
     * Admin note: coordinates are stored as [longitude, latitude] (GeoJSON order).
     */
    {
      name: 'location',
      type: 'point',
      required: true,
      admin: {
        description:
          'Enter coordinates as [longitude, latitude]. Click on the map below to set the point.',
        components: {
          Field: '@/components/admin/MapPicker#MapPicker',
        },
      },
    },
    {
      name: 'isDemo',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Demo content — remove with npm run seed:clear-demo.',
      },
    },
  ],
}
