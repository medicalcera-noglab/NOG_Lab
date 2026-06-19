import Link from 'next/link'
import { MediaImage } from '@/components/MediaImage'
import type { NewsEvent, Media } from '../../../payload-types'

interface Props {
  item: NewsEvent
}

const categoryLabels: Record<NewsEvent['category'], string> = {
  award: 'Award',
  grant: 'Grant',
  talk: 'Talk',
  conference: 'Conference',
  press: 'Press',
}

export function NewsCard({ item }: Props) {
  const cover =
    item.coverImage && typeof item.coverImage === 'object' ? (item.coverImage as Media) : null
  const date = new Date(item.date)

  return (
    <article className="border-border bg-surface flex gap-4 rounded-xl border p-4 transition-shadow hover:shadow-sm">
      {cover && (
        <div className="hidden h-24 w-24 shrink-0 overflow-hidden rounded-lg sm:block">
          <MediaImage doc={cover} sizes="96px" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-accent text-xs font-semibold tracking-wider uppercase">
            {categoryLabels[item.category]}
          </span>
          <time dateTime={item.date} className="text-muted text-xs">
            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </time>
        </div>
        <h2 className="leading-snug font-semibold">
          <Link
            href={`/news/${item.slug ?? item.id}`}
            className="hover:text-accent transition-colors focus-visible:underline focus-visible:outline-none"
          >
            {item.title}
          </Link>
        </h2>
        {item.venue && <p className="text-muted truncate text-sm">{item.venue}</p>}
        {item.registerUrl && (
          <a
            href={item.registerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent mt-1 self-start text-sm font-medium hover:underline"
          >
            Register →
          </a>
        )}
      </div>
    </article>
  )
}
