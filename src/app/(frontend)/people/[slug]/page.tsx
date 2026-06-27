import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/metadata'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Mail, ExternalLink, ArrowLeft, GraduationCap, Briefcase, Award } from 'lucide-react'
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
import type { Media, Person } from '../../../../../payload-types'

// Extended type for fields added by migration 20260628_000001_people_profile_fields
interface EducationEntry {
  id?: string | null
  degree: string
  institution: string
  country?: string | null
  startYear?: string | null
  endYear?: string | null
}

interface ExperienceEntry {
  id?: string | null
  role: string
  institution: string
  country?: string | null
  startYear?: string | null
  endYear?: string | null
}

interface GrantEntry {
  id?: string | null
  title: string
  funder?: string | null
  year?: string | null
}

interface ExtendedPerson extends Person {
  academicTitle?: string | null
  institution?: string | null
  scopus?: string | null
  education?: EducationEntry[] | null
  experience?: ExperienceEntry[] | null
  grants?: GrantEntry[] | null
}

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

  const p = person as ExtendedPerson
  const photo = (p.photo as Media | null | undefined) ?? null
  return buildMetadata(
    {
      title: p.name,
      description: p.interests?.map((i) => i.interest).join(', ') ?? undefined,
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

  const p = person as ExtendedPerson
  const alumni = isAlumni(p)
  const rl = settings.roleLabels
  const roleLabel = alumni
    ? rl?.alumni || DEFAULT_ROLE_LABELS.alumni
    : rl?.[p.role as keyof typeof rl] || DEFAULT_ROLE_LABELS[p.role] || p.role

  const [publications, projects] = await Promise.all([
    getPersonPublications(p.id),
    getPersonProjects(p.id),
  ])

  const photo = (p.photo as Media | null | undefined) ?? null
  const education = p.education ?? []
  const experience = p.experience ?? []
  const grants = p.grants ?? []

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name,
    jobTitle: p.academicTitle ?? roleLabel,
    worksFor: p.institution ? { '@type': 'Organization', name: p.institution } : undefined,
    ...(p.email ? { email: `mailto:${p.email}` } : {}),
    ...(photo?.url ? { image: photo.url } : {}),
    sameAs: [
      p.orcid ? `https://orcid.org/${p.orcid}` : null,
      p.googleScholar,
      p.scopus,
      p.linkedin,
      p.researchgate,
    ].filter(Boolean),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Section className="bg-bg py-8 md:py-16">
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
            <div className="mb-10 grid grid-cols-1 items-start gap-6 md:grid-cols-[auto_1fr] md:gap-10">
              {/* Photo */}
              <div className="mx-auto md:mx-0">
                <div
                  className={cn(
                    'relative h-44 w-32 overflow-hidden rounded-2xl sm:h-60 sm:w-44',
                    'border-border bg-surface-raised border shadow-sm',
                  )}
                >
                  {photo ? (
                    <MediaImage
                      doc={photo}
                      fill
                      sizes="192px"
                      priority
                      className="object-cover object-top"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span
                        className="text-muted font-heading text-6xl font-bold select-none"
                        aria-hidden="true"
                      >
                        {p.name.charAt(0).toUpperCase()}
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
                <h1 className="font-heading text-fg mb-1 text-3xl font-bold md:text-4xl">
                  {p.academicTitle ? `${p.academicTitle} ${p.name}` : p.name}
                </h1>

                {p.institution && <p className="text-muted mb-4 text-sm">{p.institution}</p>}

                {/* Interests */}
                {p.interests && p.interests.length > 0 && (
                  <div className="mb-5 flex flex-wrap gap-2">
                    {p.interests.map((interest) => (
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

                {/* Academic / social links */}
                <div className="flex flex-wrap items-center gap-2">
                  {p.email && (
                    <ProfileSocialLink href={`mailto:${p.email}`} label="Email" external={false}>
                      <Mail size={13} aria-hidden="true" />
                      <span>{p.email}</span>
                    </ProfileSocialLink>
                  )}
                  {p.orcid && (
                    <ProfileSocialLink href={`https://orcid.org/${p.orcid}`} label="ORCID">
                      <span className="text-xs font-bold">iD</span>
                      <span>ORCID</span>
                    </ProfileSocialLink>
                  )}
                  {p.googleScholar && (
                    <ProfileSocialLink href={p.googleScholar} label="Google Scholar">
                      <ExternalLink size={12} aria-hidden="true" />
                      <span>Google Scholar</span>
                    </ProfileSocialLink>
                  )}
                  {p.scopus && (
                    <ProfileSocialLink href={p.scopus} label="Scopus">
                      <ExternalLink size={12} aria-hidden="true" />
                      <span>Scopus</span>
                    </ProfileSocialLink>
                  )}
                  {p.linkedin && (
                    <ProfileSocialLink href={p.linkedin} label="LinkedIn">
                      <ExternalLink size={12} aria-hidden="true" />
                      <span>LinkedIn</span>
                    </ProfileSocialLink>
                  )}
                  {p.researchgate && (
                    <ProfileSocialLink href={p.researchgate} label="ResearchGate">
                      <ExternalLink size={12} aria-hidden="true" />
                      <span>ResearchGate</span>
                    </ProfileSocialLink>
                  )}
                </div>

                {/* Dates for alumni */}
                {alumni && (p.joinedDate || p.leftDate) && (
                  <p className="text-muted mt-4 text-xs">
                    {p.joinedDate && (
                      <>
                        Joined{' '}
                        <time dateTime={p.joinedDate}>
                          {new Date(p.joinedDate).toLocaleDateString('en-GB', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </time>
                      </>
                    )}
                    {p.joinedDate && p.leftDate && ' · '}
                    {p.leftDate && (
                      <>
                        Left{' '}
                        <time dateTime={p.leftDate}>
                          {new Date(p.leftDate).toLocaleDateString('en-GB', {
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
          {p.bio && (
            <FadeUp delay={0.1}>
              <section aria-labelledby="bio-heading" className="mb-12">
                <h2 id="bio-heading" className="font-heading text-fg mb-4 text-xl font-bold">
                  Biography
                </h2>
                <RichText data={p.bio} className="max-w-3xl text-base" />
              </section>
            </FadeUp>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <FadeUp delay={0.11}>
              <section aria-labelledby="experience-heading" className="mb-12">
                <h2
                  id="experience-heading"
                  className="font-heading text-fg mb-6 flex items-center gap-2 text-xl font-bold"
                >
                  <Briefcase size={18} style={{ color: 'var(--color-teal)' }} aria-hidden="true" />
                  Academic Experience
                </h2>
                <ol className="relative space-y-6 border-l-2 border-[var(--border)] pl-6">
                  {experience.map((entry, i) => (
                    <li key={entry.id ?? i} className="relative">
                      <span
                        className="bg-bg absolute top-1.5 -left-[25px] h-3 w-3 rounded-full border-2 border-[var(--color-teal)]"
                        aria-hidden="true"
                      />
                      <p className="text-fg text-sm leading-snug font-semibold">{entry.role}</p>
                      <p className="text-muted mt-0.5 text-sm">
                        {entry.institution}
                        {entry.country ? `, ${entry.country}` : ''}
                      </p>
                      {(entry.startYear || entry.endYear) && (
                        <p className="text-muted mt-0.5 text-xs">
                          {entry.startYear ?? ''}
                          {entry.endYear ? `–${entry.endYear}` : ''}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            </FadeUp>
          )}

          {/* Education */}
          {education.length > 0 && (
            <FadeUp delay={0.12}>
              <section aria-labelledby="education-heading" className="mb-12">
                <h2
                  id="education-heading"
                  className="font-heading text-fg mb-6 flex items-center gap-2 text-xl font-bold"
                >
                  <GraduationCap
                    size={18}
                    style={{ color: 'var(--color-teal)' }}
                    aria-hidden="true"
                  />
                  Education
                </h2>
                <ol className="relative space-y-6 border-l-2 border-[var(--border)] pl-6">
                  {education.map((entry, i) => (
                    <li key={entry.id ?? i} className="relative">
                      <span
                        className="bg-bg absolute top-1.5 -left-[25px] h-3 w-3 rounded-full border-2 border-[var(--color-teal)]"
                        aria-hidden="true"
                      />
                      <p className="text-fg text-sm leading-snug font-semibold">{entry.degree}</p>
                      <p className="text-muted mt-0.5 text-sm">
                        {entry.institution}
                        {entry.country ? `, ${entry.country}` : ''}
                      </p>
                      {(entry.startYear || entry.endYear) && (
                        <p className="text-muted mt-0.5 text-xs">
                          {entry.startYear ?? ''}
                          {entry.endYear ? `–${entry.endYear}` : ''}
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            </FadeUp>
          )}

          {/* Grants */}
          {grants.length > 0 && (
            <FadeUp delay={0.13}>
              <section aria-labelledby="grants-heading" className="mb-12">
                <h2
                  id="grants-heading"
                  className="font-heading text-fg mb-6 flex items-center gap-2 text-xl font-bold"
                >
                  <Award size={18} style={{ color: 'var(--color-coral)' }} aria-hidden="true" />
                  Grants &amp; Funding
                  <span className="text-muted text-base font-normal">({grants.length})</span>
                </h2>
                <ul role="list" className="flex flex-col gap-4">
                  {grants.map((grant, i) => (
                    <li
                      key={grant.id ?? i}
                      className="border-border bg-surface-raised rounded-xl border p-4"
                    >
                      <p className="text-fg text-sm leading-snug font-semibold">{grant.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                        {grant.funder && <span className="text-muted text-xs">{grant.funder}</span>}
                        {grant.year && (
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                            style={{
                              background:
                                'color-mix(in oklch, var(--color-coral) 12%, transparent)',
                              color: 'var(--color-coral)',
                            }}
                          >
                            {grant.year}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </FadeUp>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <FadeUp delay={0.14}>
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
            <FadeUp delay={0.16}>
              <section aria-labelledby="pubs-heading">
                <h2 id="pubs-heading" className="font-heading text-fg mb-5 text-xl font-bold">
                  Publications{' '}
                  <span className="text-muted text-base font-normal">({publications.length})</span>
                </h2>
                <ul role="list" className="flex flex-col gap-4">
                  {publications.map((pub) => (
                    <li key={pub.id}>
                      <PublicationListItem publication={pub} highlightPersonName={p.name} />
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
