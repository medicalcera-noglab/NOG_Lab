import { RichText as LexicalRichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from 'lexical'
import { cn } from '@/lib/utils'

type LexicalData = {
  root: {
    type: string
    children: { type: unknown; version: number; [k: string]: unknown }[]
    direction: ('ltr' | 'rtl') | null
    format: string
    indent: number
    version: number
  }
  [k: string]: unknown
}

interface RichTextProps {
  data: LexicalData | null | undefined
  className?: string
  disableContainer?: boolean
}

export function RichText({ data, className, disableContainer }: RichTextProps) {
  if (!data) return null
  return (
    <LexicalRichText
      data={data as unknown as SerializedEditorState}
      className={cn('richtext', className)}
      disableContainer={disableContainer}
    />
  )
}
