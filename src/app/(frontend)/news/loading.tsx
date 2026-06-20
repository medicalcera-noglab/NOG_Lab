import { Container } from '@/components/ui/Container'
import { Skeleton } from '@/components/ui/Skeleton'

export default function NewsLoading() {
  return (
    <div aria-busy="true" aria-label="Loading news">
      <Container className="py-16 md:py-24">
        {/* Header */}
        <Skeleton className="mb-3 h-10 w-36" />
        <Skeleton className="mb-12 h-5 w-52" />

        {/* Category tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>

        {/* List */}
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border-border flex gap-5 rounded-xl border p-5">
              <Skeleton className="h-20 w-28 flex-shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
