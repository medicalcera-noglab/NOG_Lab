import React from 'react'
import { IdleTimeout } from '@/components/admin/IdleTimeout'

export default function PayloadLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IdleTimeout />
      {children}
    </>
  )
}
