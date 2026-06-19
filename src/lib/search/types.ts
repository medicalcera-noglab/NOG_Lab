export type ResultType = 'publication' | 'person' | 'project' | 'blog' | 'news'

export interface SearchResult {
  type: ResultType
  id: number
  title: string
  /** Raw text with <mark>…</mark> highlight markers from ts_headline */
  snippet: string
  url: string
  rank: number
}

export interface GroupedResults {
  publications: SearchResult[]
  people: SearchResult[]
  projects: SearchResult[]
  blog: SearchResult[]
  news: SearchResult[]
  total: number
}

export interface SearchOptions {
  limitPerGroup?: number
}

export interface SearchProvider {
  search(query: string, opts?: SearchOptions): Promise<GroupedResults>
}
