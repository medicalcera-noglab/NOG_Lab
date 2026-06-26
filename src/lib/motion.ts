/**
 * Shared motion design tokens.
 * Import from here so all animation code feels like one hand.
 */

/** House cubic-bezier: fast start, cushioned landing — used for reveals, overlays, hero. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1]

/** Symmetric ease for elements that toggle between two stable states. */
export const EASE_IN_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1]

/** Standard durations in seconds. */
export const DUR = {
  xs: 0.15, // micro: icon morphs, instant chips
  sm: 0.25, // fast: overlay fade, tooltip
  md: 0.4, // base: card reveal, stagger item
  lg: 0.6, // slow: hero entrance, page fade
} as const

/**
 * whileInView viewport config: fires once when 5 % of the element is visible.
 * Using `amount` instead of a negative margin avoids elements getting stuck
 * at opacity 0 after HMR hot-reloads when sections are partially in-viewport.
 */
export const VIEWPORT = { once: true, amount: 0.05 } as const

/** Standard fade-up reveal used by FadeUp and RevealList. */
export const FADE_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
} as const

/** Pure opacity fade — for images, overlays, background panels. */
export const FADE_IN = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
} as const

/**
 * Stagger container variant — carries only transition metadata, no visual change on the parent.
 * Usage: wrap a motion.ul/div with this; give children FADE_UP variants.
 */
export function staggerContainer(stagger = 0.06, delay = 0) {
  return {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  } as const
}
