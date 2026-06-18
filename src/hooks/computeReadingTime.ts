import type { CollectionBeforeChangeHook } from 'payload'

type LexicalNode = {
  text?: string
  children?: LexicalNode[]
}

function extractText(node: LexicalNode): string {
  if (!node || typeof node !== 'object') return ''
  const parts: string[] = []
  if (typeof node.text === 'string') parts.push(node.text)
  if (Array.isArray(node.children)) {
    node.children.forEach((child) => parts.push(extractText(child)))
  }
  return parts.join(' ')
}

/**
 * Auto-computes `readingTimeMinutes` from the Lexical richtext body field.
 * Uses ~200 words/min average reading speed; minimum 1 minute.
 */
export const computeReadingTimeHook: CollectionBeforeChangeHook = ({ data }) => {
  if (!data) return data

  const body = data.body as { root?: LexicalNode } | undefined
  if (body?.root) {
    const text = extractText(body.root)
    const wordCount = text.split(/\s+/).filter(Boolean).length
    data.readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200))
  }

  return data
}
