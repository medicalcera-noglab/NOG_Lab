/**
 * Active search provider singleton.
 *
 * Swap the provider here without touching any UI code:
 *   - Now:    PostgresSearchProvider (pg_trgm + tsvector, no extra service)
 *   - Future: MeilisearchProvider  (requires MEILISEARCH_URL + MEILISEARCH_KEY env vars)
 */
import { PostgresSearchProvider } from './postgres'
import type { SearchProvider } from './types'

export type { SearchResult, GroupedResults, SearchOptions, ResultType } from './types'

let _provider: SearchProvider | null = null

export function getSearchProvider(): SearchProvider {
  if (!_provider) _provider = new PostgresSearchProvider()
  return _provider
}
