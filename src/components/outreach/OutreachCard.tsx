'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { MapPin, Calendar, ChevronDown, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MediaImage } from '@/components/MediaImage'
import { RichText } from '@/components/RichText'
import { OutreachGallery } from './OutreachGallery'
import { FadeUp } from '@/components/FadeUp'
import type { OutreachActivity, Media, Project } from '../../../payload-types'

interface OutreachCardProps {
  activity: OutreachActivity
  index: number
}

export function OutreachCard({ activity, index }: OutreachCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  const galleryImages = (activity.gallery ?? [])
    .map((item) => ({
      doc: item.image && typeof item.image === 'object' ? (item.image as Media) : null,
      caption: item.caption ?? null,
    }))
    .filter((g) => g.doc !== null)

  const project =
    activity.relatedProject && typeof activity.relatedProject === 'object'
      ? (activity.relatedProject as Project)
      : null

  const partners = activity.partnerOrgs ?? []

  const formattedDate = new Date(activity.date).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const coverImageDoc =
    activity.coverImage && typeof activity.coverImage === 'object'
      ? (activity.coverImage as Media)
      : null

  return (
    <FadeUp delay={index * 0.05}>
      <article
        className={cn(
          'border-border bg-surface flex flex-col overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md',
        )}
      >
        <div className="group relative aspect-video w-full overflow-hidden">
          <MediaImage
            doc={coverImageDoc}
            fill
            className={cn(
              'object-cover',
              !prefersReducedMotion && 'transition-transform duration-500 group-hover:scale-105',
            )}
          />
        </div>

        <div className="flex flex-col p-6">
          <div className="text-muted mb-4 flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="text-accent h-4 w-4" />
              <time dateTime={activity.date}>{formattedDate}</time>
            </div>
            {activity.location && (
              <div className="flex items-center gap-1.5 font-medium">
                <MapPin className="text-primary h-4 w-4" />
                <span>{activity.location}</span>
              </div>
            )}
          </div>

          <h3 className="font-heading text-fg mb-2 text-xl font-bold">{activity.title}</h3>

          <p className="text-muted mb-6 line-clamp-3 leading-relaxed">
            {activity.shortDescription}
          </p>

          {(partners.length > 0 || project) && (
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {partners.length > 0 &&
                partners.map((partner, i) => {
                  const name =
                    typeof partner === 'object' && partner !== null && 'name' in partner
                      ? partner.name
                      : partner
                  return (
                    <span
                      key={i}
                      className="bg-surface-raised border-border text-fg rounded-full border px-2.5 py-1 text-xs font-medium"
                    >
                      {String(name)}
                    </span>
                  )
                })}
              {project && project.slug && (
                <Link
                  href={`/projects/${project.slug}`}
                  className="text-primary hover:text-accent flex items-center gap-1 text-sm font-medium transition-colors"
                >
                  {project.title}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          )}

          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="border-border border-t pt-4">
                  {activity.body && (
                    <div className="prose prose-sm md:prose-base dark:prose-invert mb-8 max-w-none">
                      <RichText data={activity.body} />
                    </div>
                  )}

                  {galleryImages.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-heading text-fg mb-4 text-lg font-semibold">Gallery</h4>
                      <OutreachGallery images={galleryImages} />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            className="text-primary hover:bg-surface-raised border-border mt-2 flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-semibold transition-colors"
          >
            {isExpanded ? 'Close Details' : 'View Details'}
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                isExpanded && 'rotate-180',
              )}
            />
          </button>
        </div>
      </article>
    </FadeUp>
  )
}
