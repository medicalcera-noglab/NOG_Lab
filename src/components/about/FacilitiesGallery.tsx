'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { MediaImage } from '@/components/MediaImage'
import type { About, Media } from '../../../payload-types'

type Facility = NonNullable<About['facilities']>[number]

interface Props {
  facilities: Facility[]
}

export function FacilitiesGallery({ facilities }: Props) {
  const [lightbox, setLightbox] = useState<number | null>(null)

  if (facilities.length === 0) return null

  function prev() {
    setLightbox((i) => (i === null ? null : (i - 1 + facilities.length) % facilities.length))
  }
  function next() {
    setLightbox((i) => (i === null ? null : (i + 1) % facilities.length))
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') prev()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'Escape') setLightbox(null)
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3" role="list">
        {facilities.map((f, idx) => {
          const img = f.image && typeof f.image === 'object' ? (f.image as Media) : null
          if (!img) return null
          return (
            <li key={f.id ?? idx}>
              <button
                onClick={() => setLightbox(idx)}
                className="block aspect-video w-full overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:outline-none"
                aria-label={f.caption ?? img.alt ?? `Facility ${idx + 1}`}
              >
                <MediaImage
                  doc={img}
                  sizes="(max-width:640px) 50vw, 33vw"
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </button>
              {f.caption && <p className="text-muted mt-1 text-center text-xs">{f.caption}</p>}
            </li>
          )
        })}
      </ul>

      {lightbox !== null &&
        (() => {
          const f = facilities[lightbox]!
          const img = f.image && typeof f.image === 'object' ? (f.image as Media) : null
          return (
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Facility image viewer"
              className="bg-ink/80 fixed inset-0 z-50 flex items-center justify-center p-4"
              onKeyDown={handleKey}
              onClick={() => setLightbox(null)}
            >
              <div
                className="relative flex max-h-[90vh] w-full max-w-4xl flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setLightbox(null)}
                  className="bg-ink/60 absolute top-2 right-2 z-10 rounded-full p-2 text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
                {img && (
                  <MediaImage
                    doc={img}
                    sizes="(max-width:1200px) 100vw, 1200px"
                    className="max-h-[80vh] w-auto rounded-lg object-contain"
                  />
                )}
                {f.caption && <p className="mt-3 text-center text-sm text-white">{f.caption}</p>}
                {facilities.length > 1 && (
                  <>
                    <button
                      onClick={prev}
                      className="bg-ink/60 absolute top-1/2 left-2 -translate-y-1/2 rounded-full p-2 text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                      aria-label="Previous"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={next}
                      className="bg-ink/60 absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-2 text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                      aria-label="Next"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })()}
    </>
  )
}
