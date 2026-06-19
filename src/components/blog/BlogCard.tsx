import Link from 'next/link'
import { MediaImage } from '@/components/MediaImage'
import type { BlogPost, Media, Person } from '../../../payload-types'

interface Props {
  post: BlogPost
}

export function BlogCard({ post }: Props) {
  const author = typeof post.author === 'object' ? (post.author as Person) : null
  const cover =
    post.coverImage && typeof post.coverImage === 'object' ? (post.coverImage as Media) : null
  const date = post.publishedAt ? new Date(post.publishedAt) : null
  const tags = post.tags?.map((t) => t.tag) ?? []

  return (
    <article className="border-border bg-surface flex flex-col overflow-hidden rounded-xl border transition-shadow hover:shadow-md">
      {/* Image area — always rendered for consistent card height */}
      <Link
        href={`/blog/${post.slug ?? post.id}`}
        className="block aspect-video overflow-hidden"
        tabIndex={-1}
        aria-hidden
      >
        <MediaImage
          doc={cover}
          seed={post.id}
          placeholderLabel={`Illustration placeholder for ${post.title}`}
          sizes="(max-width:768px) 100vw, 50vw"
          className="h-full w-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-2">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="bg-accent/10 text-accent rounded-full px-2 py-0.5 text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        <h2 className="text-lg leading-snug font-bold">
          <Link
            href={`/blog/${post.slug ?? post.id}`}
            className="hover:text-accent transition-colors focus-visible:underline focus-visible:outline-none"
          >
            {post.title}
          </Link>
        </h2>
        <div className="text-muted border-border mt-auto flex items-center gap-2 border-t pt-2 text-sm">
          {author && <span>{(author as Person).name}</span>}
          {author && date && <span aria-hidden>·</span>}
          {date && (
            <time dateTime={post.publishedAt!}>
              {date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          )}
          {(author || date) && post.readingTimeMinutes && <span aria-hidden>·</span>}
          {post.readingTimeMinutes && <span>{post.readingTimeMinutes} min read</span>}
        </div>
      </div>
    </article>
  )
}
