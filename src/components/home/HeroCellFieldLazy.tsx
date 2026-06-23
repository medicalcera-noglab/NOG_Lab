'use client'

import dynamic from 'next/dynamic'

// ssr: false is only valid inside a Client Component
const HeroCellField = dynamic(() => import('./HeroCellField').then((m) => m.HeroCellField), {
  ssr: false,
  loading: () => null,
})

export function HeroCellFieldLazy() {
  return <HeroCellField />
}
