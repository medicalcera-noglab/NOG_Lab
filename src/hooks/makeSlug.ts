import type { CollectionBeforeValidateHook } from 'payload'

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Factory that returns a beforeValidate hook which auto-generates a slug
 * from the given source field. Only sets the slug when creating or when
 * the slug is empty — respects manually-set slugs.
 */
export const makeSlugHook =
  (sourceField = 'title'): CollectionBeforeValidateHook =>
  ({ data, originalDoc, operation }) => {
    if (!data) return data

    const source = data[sourceField] ?? originalDoc?.[sourceField]
    if (operation === 'create' && source && !data.slug) {
      data.slug = slugify(String(source))
    }
    // Allow explicit slug override on update; only auto-generate if explicitly cleared
    if (operation === 'update' && data.slug === '' && source) {
      data.slug = slugify(String(source))
    }
    return data
  }
