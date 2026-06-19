import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, DollarSign, MapPin, Users, BookOpen, Building2 } from 'lucide-react'
import {
  getSiteSettings,
  getProjectBySlug,
  getProjectStudySites,
  getAllProjectSlugs,
} from '@/lib/data'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { FadeUp } from '@/components/FadeUp'
import { MediaImage } from '@/components/MediaImage'
import { RichText } from '@/components/RichText'
import { PublicationListItem } from '@/components/publications/PublicationListItem'
import { ProjectGallery, type GalleryImage } from '@/components/projects/ProjectGallery'
import { ProjectsMiniMap } from '@/components/projects/ProjectsMiniMap'
import type { MapSite } from '@/app/(payload)/api/map-sites/route'
import { cn } from '@/lib/utils'
import type {
  Media,
  Person,
  Collaborator,
  Publication,
  ResearchTheme,
} from '../../../../../payload-types'

interface ProjectDetailProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllProjectSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: ProjectDetailProps): Promise<Metadata> {
  const { slug } = await params
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSiteSettings()])
  if (!project) return { title: 'Project not found' }

  const cover = (project.coverImage as Media | null | undefined) ?? null
  return buildMetadata(
    { title: project.title, canonical: `/projects/${slug}`, ogImage: cover?.url ?? null },
    settings,
  )
}

export default async function ProjectDetailPage({ params }: ProjectDetailProps) {
  const { slug } = await params
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSiteSettings()])

  if (!project) notFound()

  const studySites = await getProjectStudySites(project.id)

  const cover = (project.coverImage as Media | null | undefined) ?? null
  const theme = (project.theme as ResearchTheme | null | undefined) ?? null
  const team = ((project.team ?? []).filter((m) => typeof m === 'object') as Person[]).filter(
    (p) => p.is_active,
  )
  const partners = (project.partners ?? []).filter((c) => typeof c === 'object') as Collaborator[]
  const publications = (project.relatedPublications ?? []).filter(
    (p) => typeof p === 'object',
  ) as Publication[]

  // Resolve gallery images — pass pre-resolved data to the client gallery component
  const galleryImages: GalleryImage[] = (project.gallery ?? []).flatMap((item) => {
    const doc = item.image
    if (typeof doc !== 'object') return []
    const media = doc as Media
    if (!media.url) return []
    return [
      {
        url: media.url,
        alt: media.alt,
        width: media.width ?? undefined,
        height: media.height ?? undefined,
      },
    ]
  })

  // Convert study sites to MapSite format for the mini map
  const miniMapSites: MapSite[] = studySites
    .filter((s) => Array.isArray(s.location) && s.location.length === 2)
    .map((s) => ({
      id: s.id,
      name: s.name,
      district: s.district,
      province: s.province,
      lng: s.location[0],
      lat: s.location[1],
      project: {
        id: project.id,
        title: project.title,
        slug: project.slug ?? '',
        status: project.status,
      },
      theme: theme
        ? {
            id: theme.id,
            name: theme.name,
            color: theme.color ?? '#0E6E6E',
            slug: theme.slug ?? '',
          }
        : null,
    }))

  // JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ResearchProject',
    name: project.title,
    description: settings.labName,
    ...(project.funder ? { funder: { '@type': 'Organization', name: project.funder } } : {}),
    ...(project.startDate ? { startDate: project.startDate } : {}),
    ...(project.endDate ? { endDate: project.endDate } : {}),
  }

  const formatDate = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : null

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Section className="bg-bg py-16 md:py-24">
        <Container>
          {/* Back */}
          <FadeUp>
            <Link
              href="/projects"
              className={cn(
                'text-muted hover:text-fg mb-10 inline-flex items-center gap-2 text-sm',
                'transition-colors duration-150',
                'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
              )}
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Back to projects
            </Link>
          </FadeUp>

          {/* Cover image */}
          {cover && (
            <FadeUp delay={0.03}>
              <div className="bg-surface-raised mb-10 overflow-hidden rounded-2xl">
                <div className="relative aspect-[21/9]">
                  <MediaImage
                    doc={cover}
                    fill
                    sizes="(max-width: 1280px) 100vw, 1280px"
                    priority
                    className="object-cover"
                  />
                </div>
              </div>
            </FadeUp>
          )}

          {/* Header */}
          <FadeUp delay={0.05}>
            <div className="mb-10">
              {/* Theme + status */}
              <div className="mb-4 flex flex-wrap gap-2">
                {theme && (
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: `color-mix(in oklch, ${theme.color} 15%, transparent)`,
                      color: theme.color,
                    }}
                  >
                    {theme.name}
                  </span>
                )}
                <span
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-semibold capitalize',
                    project.status === 'ongoing'
                      ? 'bg-primary/10 text-primary'
                      : 'bg-surface-raised text-muted',
                  )}
                >
                  {project.status}
                </span>
              </div>

              <h1 className="font-heading text-fg mb-6 text-3xl font-bold md:text-4xl lg:text-5xl">
                {project.title}
              </h1>

              {/* Meta: funder, dates */}
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {project.funder && (
                  <MetaItem icon={<DollarSign size={14} aria-hidden="true" />}>
                    {project.funder}
                    {project.funderAmount && (
                      <span className="text-muted ml-1">({project.funderAmount})</span>
                    )}
                  </MetaItem>
                )}
                {(project.startDate || project.endDate) && (
                  <MetaItem icon={<Calendar size={14} aria-hidden="true" />}>
                    {[formatDate(project.startDate), formatDate(project.endDate)]
                      .filter(Boolean)
                      .join(' – ')}
                  </MetaItem>
                )}
                {studySites.length > 0 && (
                  <MetaItem icon={<MapPin size={14} aria-hidden="true" />}>
                    {studySites.length} study site{studySites.length !== 1 ? 's' : ''}
                  </MetaItem>
                )}
              </div>
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[2fr_1fr]">
            {/* ── Main column ── */}
            <div>
              {/* Summary */}
              {project.summary && (
                <FadeUp delay={0.07}>
                  <section aria-labelledby="summary-heading" className="mb-10">
                    <h2
                      id="summary-heading"
                      className="font-heading text-fg mb-4 text-xl font-bold"
                    >
                      Summary
                    </h2>
                    <RichText data={project.summary} className="max-w-3xl text-base" />
                  </section>
                </FadeUp>
              )}

              {/* Objectives */}
              {project.objectives && project.objectives.length > 0 && (
                <FadeUp delay={0.09}>
                  <section aria-labelledby="obj-heading" className="mb-10">
                    <h2 id="obj-heading" className="font-heading text-fg mb-4 text-xl font-bold">
                      Objectives
                    </h2>
                    <ol className="flex flex-col gap-3">
                      {project.objectives.map((o, i) => (
                        <li key={o.id ?? i} className="flex gap-3">
                          <span
                            className="text-primary mt-0.5 text-sm font-bold tabular-nums"
                            aria-hidden="true"
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-fg text-sm leading-relaxed">{o.objective}</span>
                        </li>
                      ))}
                    </ol>
                  </section>
                </FadeUp>
              )}

              {/* Methods */}
              {project.methods && project.methods.length > 0 && (
                <FadeUp delay={0.11}>
                  <section aria-labelledby="methods-heading" className="mb-10">
                    <h2
                      id="methods-heading"
                      className="font-heading text-fg mb-4 text-xl font-bold"
                    >
                      Methods
                    </h2>
                    <ul className="flex flex-wrap gap-2">
                      {project.methods.map((m, i) => (
                        <li
                          key={m.id ?? i}
                          className="border-border bg-surface-raised text-muted rounded-full border px-3 py-1 text-sm"
                        >
                          {m.method}
                        </li>
                      ))}
                    </ul>
                  </section>
                </FadeUp>
              )}

              {/* Gallery */}
              {galleryImages.length > 0 && (
                <FadeUp delay={0.12}>
                  <section aria-labelledby="gallery-heading" className="mb-10">
                    <h2
                      id="gallery-heading"
                      className="font-heading text-fg mb-4 text-xl font-bold"
                    >
                      Gallery
                    </h2>
                    <ProjectGallery images={galleryImages} />
                  </section>
                </FadeUp>
              )}

              {/* Publications / outputs */}
              {publications.length > 0 && (
                <FadeUp delay={0.13}>
                  <section aria-labelledby="pubs-heading" className="mb-10">
                    <h2 id="pubs-heading" className="font-heading text-fg mb-4 text-xl font-bold">
                      <BookOpen
                        size={20}
                        className="text-primary mr-2 inline-block"
                        aria-hidden="true"
                      />
                      Outputs &amp; Publications
                    </h2>
                    <ul role="list" className="flex flex-col gap-4">
                      {publications.map((pub) => (
                        <li key={pub.id}>
                          <PublicationListItem publication={pub} />
                        </li>
                      ))}
                    </ul>
                  </section>
                </FadeUp>
              )}

              {/* Study sites */}
              {studySites.length > 0 && (
                <FadeUp delay={0.14}>
                  <section aria-labelledby="sites-heading" className="mb-10">
                    <h2 id="sites-heading" className="font-heading text-fg mb-4 text-xl font-bold">
                      <MapPin
                        size={20}
                        className="text-primary mr-2 inline-block"
                        aria-hidden="true"
                      />
                      Study Sites
                    </h2>

                    {miniMapSites.length > 0 && (
                      <div className="mb-4">
                        <ProjectsMiniMap sites={miniMapSites} />
                      </div>
                    )}

                    <ul role="list" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {studySites.map((site) => (
                        <li
                          key={site.id}
                          className="border-border bg-bg flex items-start gap-3 rounded-lg border p-3"
                        >
                          <MapPin
                            size={14}
                            className="text-primary mt-0.5 shrink-0"
                            aria-hidden="true"
                          />
                          <div>
                            <p className="text-fg text-sm font-semibold">{site.name}</p>
                            <p className="text-muted text-xs">
                              {site.district}, {site.province}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                </FadeUp>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="flex flex-col gap-8">
              {/* Team */}
              {team.length > 0 && (
                <FadeUp delay={0.08}>
                  <aside aria-labelledby="team-heading">
                    <h2 id="team-heading" className="font-heading text-fg mb-4 text-base font-bold">
                      <Users
                        size={16}
                        className="text-primary mr-2 inline-block"
                        aria-hidden="true"
                      />
                      Team
                    </h2>
                    <ul role="list" className="flex flex-col gap-2">
                      {team.map((person) => {
                        const photo = (person.photo as Media | null | undefined) ?? null
                        const personSlug = person.slug ?? String(person.id)
                        return (
                          <li key={person.id}>
                            <Link
                              href={`/people/${personSlug}`}
                              className={cn(
                                'border-border bg-bg flex items-center gap-3 rounded-lg border p-3',
                                'transition-shadow duration-150 hover:shadow-sm',
                                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                              )}
                            >
                              <div
                                className="bg-surface-raised h-8 w-8 shrink-0 overflow-hidden rounded-full"
                                aria-hidden="true"
                              >
                                {photo?.url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={photo.url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <span className="text-muted text-xs font-bold">
                                      {person.name.charAt(0)}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-fg truncate text-xs font-semibold">
                                  {person.name}
                                </p>
                                <p className="text-muted truncate text-[10px] capitalize">
                                  {person.role.replace('_', ' ')}
                                </p>
                              </div>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </aside>
                </FadeUp>
              )}

              {/* Partners */}
              {partners.length > 0 && (
                <FadeUp delay={0.1}>
                  <aside aria-labelledby="partners-heading">
                    <h2
                      id="partners-heading"
                      className="font-heading text-fg mb-4 text-base font-bold"
                    >
                      <Building2
                        size={16}
                        className="text-primary mr-2 inline-block"
                        aria-hidden="true"
                      />
                      Partners
                    </h2>
                    <ul role="list" className="flex flex-col gap-2">
                      {partners.map((collab) => {
                        const logo = (collab.logo as Media | null | undefined) ?? null
                        return (
                          <li
                            key={collab.id}
                            className="border-border bg-bg flex items-center gap-3 rounded-lg border p-3"
                          >
                            {logo?.url ? (
                              <div className="relative h-8 w-16 shrink-0" aria-hidden="true">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={logo.url}
                                  alt=""
                                  className="h-full w-full object-contain grayscale"
                                  loading="lazy"
                                />
                              </div>
                            ) : null}
                            <div className="min-w-0">
                              <p className="text-fg text-xs font-semibold">{collab.name}</p>
                              {collab.country && (
                                <p className="text-muted text-[10px]">{collab.country}</p>
                              )}
                            </div>
                            {collab.website && (
                              <a
                                href={collab.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`${collab.name} website (opens in new tab)`}
                                className="text-muted hover:text-primary ml-auto text-xs"
                              >
                                ↗
                              </a>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </aside>
                </FadeUp>
              )}
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}

function MetaItem({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="text-muted inline-flex items-center gap-1.5 text-sm">
      <span className="text-primary">{icon}</span>
      {children}
    </span>
  )
}
