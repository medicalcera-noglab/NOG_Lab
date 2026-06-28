'use client'

import type { DefaultCellComponentProps } from 'payload'

export function InquiryNameCell({ cellData, rowData }: DefaultCellComponentProps) {
  const isRead = Boolean((rowData as Record<string, unknown>)?.isRead)
  return (
    <span
      style={{ fontWeight: isRead ? 400 : 700, color: isRead ? undefined : 'var(--theme-text)' }}
    >
      {String(cellData ?? '')}
    </span>
  )
}
