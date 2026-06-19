/** Single source of truth for primary navigation links.
 *  Labels are intentionally short — i18n will wrap them in a later step.
 *  Add or reorder here to update every rendered navbar and mobile menu. */
export interface NavLink {
  label: string
  href: string
}

export const PRIMARY_NAV: NavLink[] = [
  { label: 'Research', href: '/research' },
  { label: 'People', href: '/people' },
  { label: 'Publications', href: '/publications' },
  { label: 'News', href: '/news' },
  { label: 'Join', href: '/join' },
  { label: 'Contact', href: '/contact' },
]
