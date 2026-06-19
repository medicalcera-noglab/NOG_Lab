/** Single source of truth for primary navigation links.
 *  `msgKey` is a key inside the `nav` message namespace (messages/en.json).
 *  Add or reorder here to update every rendered navbar and mobile menu. */
export interface NavLink {
  msgKey: string
  href: string
}

export const PRIMARY_NAV: NavLink[] = [
  { msgKey: 'research', href: '/research' },
  { msgKey: 'people', href: '/people' },
  { msgKey: 'publications', href: '/publications' },
  { msgKey: 'news', href: '/news' },
  { msgKey: 'join', href: '/join' },
  { msgKey: 'contact', href: '/contact' },
]
