import Link from 'next/link'
import { FileText, ExternalLink, Unlock, BookMarked } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Publication, Media } from '../../../payload-types'

interface PublicationListItemProps {
  publication: Publication
  /** Highlight this person's name (for profile pages). */
  highlightPersonName?: string
  /**
   * When true, renders per-item BibTeX and RIS download links.
   * Uses /publications/export/[format]?ids=<id> route.
   */
  showCiteLinks?: boolean
}

const TYPE_LABELS: Record<Publication['type'], string> = {
  journal_article: 'Journal article',
  conference: 'Conference paper',
  preprint: 'Preprint',
  book_chapter: 'Book chapter',
}

export function PublicationListItem({
  publication: pub,
  highlightPersonName,
  showCiteLinks = false,
}: PublicationListItemProps) {
  const pdf = (pub.pdf as Media | null | undefined) ?? null
  const pdfUrl = pdf?.url ?? null
  const doiUrl = pub.doi ? `https://doi.org/${pub.doi}` : null

  const authorLine = pub.authors
    .map((a) => {
      if (highlightPersonName && a.author === highlightPersonName) {
        return (
          <strong key={a.id ?? a.author} className="text-fg font-semibold">
            {a.author}
          </strong>
        )
      }
      return <span key={a.id ?? a.author}>{a.author}</span>
    })
    .reduce<React.ReactNode[]>((acc, node, idx) => {
      if (idx > 0) acc.push(<span key={`sep-${idx}`}>, </span>)
      acc.push(node)
      return acc
    }, [])

  return (
    <article
      className={cn(
        'border-border bg-bg rounded-lg border p-5',
        'transition-shadow duration-150 hover:shadow-sm',
      )}
    >
      {/* Type badge + year + OA */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="bg-surface-raised text-muted rounded px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
          {TYPE_LABELS[pub.type]}
        </span>
        <span className="text-muted text-xs">{pub.year}</span>
        {pub.isOpenAccess && (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400"
            title="Open Access"
          >
            <Unlock size={11} aria-hidden="true" />
            Open Access
          </span>
        )}
        {pub.citationCount != null && pub.citationCount > 0 && (
          <span className="text-muted text-xs">
            {pub.citationCount} citation{pub.citationCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-heading text-fg mb-2 text-sm leading-snug font-bold">
        {doiUrl ? (
          <a
            href={doiUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'hover:text-primary transition-colors duration-150',
              'focus-visible:ring-ring rounded focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            {pub.title}
          </a>
        ) : (
          pub.title
        )}
      </h3>

      {/* Authors */}
      <p className="text-muted mb-2 text-xs leading-relaxed">{authorLine}</p>

      {/* Journal */}
      {pub.journal && <p className="text-muted mb-3 text-xs italic">{pub.journal}</p>}

      {/* Action links */}
      <div className="flex flex-wrap gap-3">
        {doiUrl && (
          <a
            href={doiUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${pub.title} on publisher site`}
            className={cn(
              'text-primary inline-flex items-center gap-1 text-xs font-semibold',
              'focus-visible:ring-ring rounded hover:underline focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            <ExternalLink size={12} aria-hidden="true" />
            DOI
          </a>
        )}
        {pdfUrl && (
          <Link
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Download PDF of ${pub.title}`}
            className={cn(
              'text-primary inline-flex items-center gap-1 text-xs font-semibold',
              'focus-visible:ring-ring rounded hover:underline focus-visible:ring-2 focus-visible:outline-none',
            )}
          >
            <FileText size={12} aria-hidden="true" />
            PDF
          </Link>
        )}
        {showCiteLinks && (
          <>
            <a
              href={`/publications/export/bibtex?ids=${pub.id}`}
              download={`${pub.id}.bib`}
              aria-label={`Download BibTeX citation for ${pub.title}`}
              className={cn(
                'text-muted inline-flex items-center gap-1 text-xs font-semibold',
                'focus-visible:ring-ring hover:text-fg rounded hover:underline focus-visible:ring-2 focus-visible:outline-none',
              )}
            >
              <BookMarked size={12} aria-hidden="true" />
              BibTeX
            </a>
            <a
              href={`/publications/export/ris?ids=${pub.id}`}
              download={`${pub.id}.ris`}
              aria-label={`Download RIS citation for ${pub.title}`}
              className={cn(
                'text-muted inline-flex items-center gap-1 text-xs font-semibold',
                'focus-visible:ring-ring hover:text-fg rounded hover:underline focus-visible:ring-2 focus-visible:outline-none',
              )}
            >
              <BookMarked size={12} aria-hidden="true" />
              RIS
            </a>
          </>
        )}
      </div>
    </article>
  )
}
