type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
  [key: string]: unknown
}

type LexicalRoot = {
  root: LexicalNode
  [key: string]: unknown
}

/** Extracts plain text from a Payload Lexical richText value. Returns '' on null input. */
export function lexicalToText(richText: LexicalRoot | null | undefined, separator = ' '): string {
  if (!richText?.root) return ''
  const walk = (node: LexicalNode): string => {
    if (node.type === 'text') return String(node.text ?? '')
    const children = node.children ?? []
    const joined = children.map(walk).join('')
    if (node.type === 'paragraph' || node.type === 'heading') return joined + separator
    return joined
  }
  return walk(richText.root).trim()
}
