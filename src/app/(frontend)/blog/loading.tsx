import { Container } from '@/components/ui/Container'
import { Skeleton } from '@/components/ui/Skeleton'

export default function BlogLoading() {
  return (
    <div aria-busy="true" aria-label="Loading blog posts">
      <Container className="py-8 md:py-16">
        {/* Header */}
        <Skeleton className="mb-3 h-10 w-24" />
        <Skeleton className="mb-12 h-5 w-48" />

        {/* Tag filter row */}
        <div className="mb-8 flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>

        {/* Card grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-surface overflow-hidden rounded-xl">
              <Skeleton className="aspect-video w-full rounded-none" />
              <div className="space-y-2 p-5">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
