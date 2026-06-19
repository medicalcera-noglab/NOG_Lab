'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface GalleryImage {
  url: string
  alt: string
  width?: number | null
  height?: number | null
}

interface ProjectGalleryProps {
  images: GalleryImage[]
}

export function ProjectGallery({ images }: ProjectGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const prefersReducedMotion = useReducedMotion()

  // Refs for focus management
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([])
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  const isOpen = openIndex !== null
  const current = openIndex ?? 0

  const openAt = (i: number) => setOpenIndex(i)
  const close = useCallback(() => {
    const i = openIndex
    setOpenIndex(null)
    // Return focus to the thumbnail that opened the lightbox
    if (i !== null) {
      requestAnimationFrame(() => triggerRefs.current[i]?.focus())
    }
  }, [openIndex])

  const prev = useCallback(() => {
    setOpenIndex((i) => (i === null ? 0 : (i - 1 + images.length) % images.length))
  }, [images.length])

  const next = useCallback(() => {
    setOpenIndex((i) => (i === null ? 0 : (i + 1) % images.length))
  }, [images.length])

  // Keyboard handling
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close, prev, next])

  // Focus the close button when lightbox opens
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => closeRef.current?.focus())
    }
  }, [isOpen])

  // Focus trap inside the dialog
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return
    const dialog = dialogRef.current
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last?.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first?.focus()
        }
      }
    }

    dialog.addEventListener('keydown', trap)
    return () => dialog.removeEventListener('keydown', trap)
  }, [isOpen, current])

  if (images.length === 0) return null

  const img = images[current]

  return (
    <>
      {/* Thumbnail grid */}
      <div
        role="list"
        aria-label={`Project gallery — ${images.length} image${images.length !== 1 ? 's' : ''}`}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
      >
        {images.map((image, i) => (
          <div key={i} role="listitem">
            <button
              ref={(el) => {
                triggerRefs.current[i] = el
              }}
              type="button"
              onClick={() => openAt(i)}
              aria-label={`Open image ${i + 1}: ${image.alt}`}
              className={cn(
                'group relative block w-full overflow-hidden rounded-lg',
                'bg-surface-raised aspect-square',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                'cursor-zoom-in',
              )}
            >
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={cn(
                  'object-cover',
                  !prefersReducedMotion &&
                    'transition-transform duration-300 group-hover:scale-[1.05]',
                )}
                loading="lazy"
              />
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Image ${current + 1} of ${images.length}: ${img.alt}`}
          ref={dialogRef}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/85" aria-hidden="true" />

          {/* Dialog panel */}
          <div className="relative z-10 flex max-h-screen w-full max-w-5xl flex-col items-center px-4 py-16">
            {/* Close */}
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close image viewer"
              className={cn(
                'absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full',
                'bg-white/10 text-white hover:bg-white/20',
                'focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
                'transition-colors duration-150',
              )}
            >
              <X size={20} aria-hidden="true" />
            </button>

            {/* Image */}
            <div className="relative flex max-h-[80vh] w-full items-center justify-center">
              {img.width && img.height ? (
                <Image
                  src={img.url}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
                  priority
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={img.url}
                  alt={img.alt}
                  className="max-h-[80vh] max-w-full rounded-lg object-contain shadow-2xl"
                />
              )}
            </div>

            {/* Alt text caption */}
            {img.alt && <p className="mt-3 text-center text-sm text-white/70">{img.alt}</p>}

            {/* Counter */}
            <p className="mt-1 text-xs text-white/50" aria-live="polite">
              {current + 1} / {images.length}
            </p>
          </div>

          {/* Prev / Next */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Previous image"
                className={cn(
                  'absolute top-1/2 left-4 z-10 -translate-y-1/2',
                  'flex h-11 w-11 items-center justify-center rounded-full',
                  'bg-white/10 text-white hover:bg-white/20',
                  'focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
                  'transition-colors duration-150',
                )}
              >
                <ChevronLeft size={22} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next image"
                className={cn(
                  'absolute top-1/2 right-4 z-10 -translate-y-1/2',
                  'flex h-11 w-11 items-center justify-center rounded-full',
                  'bg-white/10 text-white hover:bg-white/20',
                  'focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
                  'transition-colors duration-150',
                )}
              >
                <ChevronRight size={22} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      )}
    </>
  )
}
