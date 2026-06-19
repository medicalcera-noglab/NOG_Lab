import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Mail, ExternalLink, ArrowLeft } from 'lucide-react'
import {
  getSiteSettings,
  getPersonBySlug,
  getPersonPublications,
  getPersonProjects,
  getAllPeopleSlugs,
  isAlumni,
} from '@/lib/data'
import { Section } from '@/components/ui/Section'
import { Container } from '@/components/ui/Container'
import { FadeUp } from '@/components/FadeUp'
import { MediaImage } from '@/components/MediaImage'
import { RichText } from '@/components/RichText'
import { PublicationListItem } from '@/components/publications/PublicationListItem'
import { cn } from '@/lib/utils'
import type { Media } from '../../../../../payload-types'

const DEFAULT_ROLE_LABELS: Record<string, string> = {
  pi: 'Principal Investigator',
  postdoc: 'Postdoctoral Researcher',
  phd: 'PhD Student',
  ms: 'MS Student',
  staff: 'Staff',
  alumni: 'Alumni',
}

interface ProfilePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllPeopleSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { slug } = await params
  const [person, settings] = await Promise.all([getPersonBySlug(slug), getSiteSettings()])
  if (!person) return { title: 'Person not found' }

  const photo = (person.photo as Media | null | undefined) ?? null
  return buildMetadata(
    {
      title: person.name,
      description: person.interests?.map((i) => i.interest).join(', ') ?? undefined,
      canonical: `/people/${slug}`,
      ogImage: photo?.url ?? null,
    },
    settings,
  )
}

export default async function PersonProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params
  const [person, settings] = await Promise.all([getPersonBySlug(slug), getSiteSettings()])

  if (!person) notFound()

  const alumni = isAlumni(person)
  const rl = settings.roleLabels
  const roleLabel = alumni
    ? rl?.alumni || DEFAULT_ROLE_LABELS.alumni
    : rl?.[person.role as keyof typeof rl] || DEFAULT_ROLE_LABELS[person.role] || person.role

  const [publications, projects] = await Promise.all([
    getPersonPublications(person.id),
    getPersonProjects(person.id),
  ])

  const photo = (person.photo as Media | null | undefined) ?? null

  // JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    jobTitle: roleLabel,
    ...(person.email ? { email: `mailto:${person.email}` } : {}),
    ...(photo?.url ? { image: photo.url } : {}),
    sameAs: [
      person.orcid ? `https://orcid.org/${person.orcid}` : null,
      person.googleScholar,
      person.linkedin,
      person.researchgate,
    ].filter(Boolean),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Section className="bg-bg py-16 md:py-24">
        <Container>
          {/* Back link */}
          <FadeUp>
            <Link
              href="/people"
              className={cn(
                'text-muted hover:text-fg mb-10 inline-flex items-center gap-2 text-sm',
                'transition-colors duration-150',
                'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
              )}
            >
              <ArrowLeft size={15} aria-hidden="true" />
              Back to people
            </Link>
          </FadeUp>

          {/* Profile header */}
          <FadeUp delay={0.05}>
            <div className="mb-12 grid grid-cols-1 items-start gap-10 md:grid-cols-[auto_1fr]">
              {/* Photo */}
              <div className="mx-auto md:mx-0">
                <div
                  className={cn(
                    'relative h-48 w-48 overflow-hidden rounded-2xl',
                    'border-border bg-surface-raised border shadow-sm',
                  )}
                >
                  {photo ? (
                    <MediaImage doc={photo} fill sizes="192px" priority className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span
                        className="text-muted font-heading text-6xl font-bold select-none"
                        aria-hidden="true"
                      >
                        {person.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Name, role, links */}
              <div>
                <p className="text-primary mb-2 text-xs font-semibold tracking-[0.15em] uppercase">
                  {roleLabel}
                </p>
                <h1 className="font-heading text-fg mb-4 text-3xl font-bold md:text-4xl">
                  {person.name}
                </h1>

                {/* Interests */}
                {person.interests && person.interests.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {person.interests.map((interest) => (
                      <span
                        key={interest.id ?? interest.interest}
                        className={cn(
                          'border-border bg-surface-raised text-muted rounded-full border px-3 py-1 text-xs',
                        )}
                      >
                        {interest.interest}
                      </span>
                    ))}
                  </div>
                )}

                {/* Social links */}
                <div className="flex flex-wrap items-center gap-3">
                  {person.email && (
                    <ProfileSocialLink
                      href={`mailto:${person.email}`}
                      label="Email"
                      external={false}
                    >
                      <Mail size={15} aria-hidden="true" />
                      <span>{person.email}</span>
                    </ProfileSocialLink>
                  )}
                  {person.orcid && (
                    <ProfileSocialLink href={`https://orcid.org/${person.orcid}`} label="ORCID">
                      <span className="text-xs font-bold">iD</span>
                      <span>ORCID</span>
                    </ProfileSocialLink>
                  )}
                  {person.googleScholar && (
                    <ProfileSocialLink href={person.googleScholar} label="Google Scholar">
                      <ExternalLink size={14} aria-hidden="true" />
                      <span>Google Scholar</span>
                    </ProfileSocialLink>
                  )}
                  {person.linkedin && (
                    <ProfileSocialLink href={person.linkedin} label="LinkedIn">
                      <ExternalLink size={14} aria-hidden="true" />
                      <span>LinkedIn</span>
                    </ProfileSocialLink>
                  )}
                  {person.researchgate && (
                    <ProfileSocialLink href={person.researchgate} label="ResearchGate">
                      <ExternalLink size={14} aria-hidden="true" />
                      <span>ResearchGate</span>
                    </ProfileSocialLink>
                  )}
                </div>

                {/* Dates for alumni */}
                {alumni && (person.joinedDate || person.leftDate) && (
                  <p className="text-muted mt-4 text-xs">
                    {person.joinedDate && (
                      <>
                        Joined{' '}
                        <time dateTime={person.joinedDate}>
                          {new Date(person.joinedDate).toLocaleDateString('en-GB', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </time>
                      </>
                    )}
                    {person.joinedDate && person.leftDate && ' · '}
                    {person.leftDate && (
                      <>
                        Left{' '}
                        <time dateTime={person.leftDate}>
                          {new Date(person.leftDate).toLocaleDateString('en-GB', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </time>
                      </>
                    )}
                  </p>
                )}
              </div>
            </div>
          </FadeUp>

          {/* Bio */}
          {person.bio && (
            <FadeUp delay={0.1}>
              <section aria-labelledby="bio-heading" className="mb-12">
                <h2 id="bio-heading" className="font-heading text-fg mb-4 text-xl font-bold">
                  Biography
                </h2>
                <RichText data={person.bio} className="max-w-3xl text-base" />
              </section>
            </FadeUp>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <FadeUp delay={0.12}>
              <section aria-labelledby="projects-heading" className="mb-12">
                <h2 id="projects-heading" className="font-heading text-fg mb-5 text-xl font-bold">
                  Projects
                </h2>
                <ul role="list" className="flex flex-col gap-3">
                  {projects.map((project) => (
                    <li key={project.id}>
                      <Link
                        href={`/projects/${project.slug ?? project.id}`}
                        className={cn(
                          'border-border bg-bg group flex items-center justify-between rounded-lg border p-4 hover:shadow-sm',
                          'transition-shadow duration-150',
                          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
                        )}
                      >
                        <span className="font-heading text-fg text-sm font-bold">
                          {project.title}
                        </span>
                        <span
                          className={cn(
                            'ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize',
                            project.status === 'ongoing'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-surface-raised text-muted',
                          )}
                        >
                          {project.status}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </FadeUp>
          )}

          {/* Publications */}
          {publications.length > 0 && (
            <FadeUp delay={0.14}>
              <section aria-labelledby="pubs-heading">
                <h2 id="pubs-heading" className="font-heading text-fg mb-5 text-xl font-bold">
                  Publications{' '}
                  <span className="text-muted text-base font-normal">({publications.length})</span>
                </h2>
                <ul role="list" className="flex flex-col gap-4">
                  {publications.map((pub) => (
                    <li key={pub.id}>
                      <PublicationListItem publication={pub} highlightPersonName={person.name} />
                    </li>
                  ))}
                </ul>
              </section>
            </FadeUp>
          )}
        </Container>
      </Section>
    </>
  )
}

function ProfileSocialLink({
  href,
  label,
  external = true,
  children,
}: {
  href: string
  label: string
  external?: boolean
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      aria-label={label}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={cn(
        'border-border text-muted hover:border-primary hover:text-primary bg-bg inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium',
        'transition-colors duration-150',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
      )}
    >
      {children}
    </a>
  )
}
