import Link from 'next/link'
import { Mail, ExternalLink } from 'lucide-react'
import { MediaImage } from '@/components/MediaImage'
import { cn } from '@/lib/utils'
import type { Person, Media } from '../../../payload-types'

interface PersonCardProps {
  person: Person
  roleLabel: string
}

export function PersonCard({ person, roleLabel }: PersonCardProps) {
  const photo = (person.photo as Media | null | undefined) ?? null
  const slug = person.slug ?? String(person.id)

  return (
    <article
      className={cn(
        'group border-border bg-bg flex flex-col overflow-hidden rounded-xl border',
        'transition-shadow duration-200 hover:shadow-md',
      )}
    >
      {/* Photo — always rendered; MediaImage shows placeholder when photo is absent */}
      <Link
        href={`/people/${slug}`}
        tabIndex={-1}
        aria-hidden="true"
        className="bg-surface-raised block aspect-[4/3] overflow-hidden"
      >
        <div className="relative h-full w-full">
          <MediaImage
            doc={photo}
            fill
            seed={person.id}
            placeholderLabel={`Illustration placeholder for ${person.name}`}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-primary mb-1 text-xs font-semibold tracking-wide uppercase">
          {roleLabel}
        </p>

        <h3 className="font-heading text-fg mb-3 text-base leading-snug font-bold">
          <Link
            href={`/people/${slug}`}
            className={cn(
              'hover:text-primary transition-colors duration-150',
              'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            {person.name}
          </Link>
        </h3>

        {person.interests && person.interests.length > 0 && (
          <p className="text-muted mb-4 line-clamp-2 text-xs leading-relaxed">
            {person.interests.map((i) => i.interest).join(' · ')}
          </p>
        )}

        {/* Social icon links */}
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {person.email && (
            <SocialLink
              href={`mailto:${person.email}`}
              label={`Email ${person.name}`}
              external={false}
            >
              <Mail size={15} aria-hidden="true" />
            </SocialLink>
          )}
          {person.orcid && (
            <SocialLink
              href={`https://orcid.org/${person.orcid}`}
              label={`ORCID profile of ${person.name}`}
            >
              <span className="text-[11px] leading-none font-bold">iD</span>
            </SocialLink>
          )}
          {person.googleScholar && (
            <SocialLink
              href={person.googleScholar}
              label={`Google Scholar profile of ${person.name}`}
            >
              <ExternalLink size={14} aria-hidden="true" />
            </SocialLink>
          )}
          {person.linkedin && (
            <SocialLink href={person.linkedin} label={`LinkedIn profile of ${person.name}`}>
              <ExternalLink size={14} aria-hidden="true" />
            </SocialLink>
          )}
          {person.researchgate && (
            <SocialLink href={person.researchgate} label={`ResearchGate profile of ${person.name}`}>
              <ExternalLink size={14} aria-hidden="true" />
            </SocialLink>
          )}
        </div>
      </div>
    </article>
  )
}

function SocialLink({
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
        'border-border text-muted hover:border-primary hover:text-primary bg-bg inline-flex min-h-[32px] min-w-[32px] items-center justify-center rounded-md border',
        'transition-colors duration-150',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
      )}
    >
      {children}
    </a>
  )
}
