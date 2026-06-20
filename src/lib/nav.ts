/** Typed shape of a navigation link as returned by the Navigation global. */
export interface NavItem {
  label: string
  labelUr?: string | null
  href: string
  isExternal?: boolean | null
  isVisible?: boolean | null
}
