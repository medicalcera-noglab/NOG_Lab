import type { CollectionBeforeChangeHook } from 'payload'

/**
 * Auto-stamps `createdBy` with the current user's ID on document creation.
 * This field is used for contributor ownership checks in access control.
 */
export const setCreatedByHook: CollectionBeforeChangeHook = ({ data, req, operation }) => {
  if (operation === 'create' && req.user && data) {
    data.createdBy = req.user.id
  }
  return data
}
