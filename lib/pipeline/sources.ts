import crypto from 'crypto'

export interface RawItem {
  id: string
  title: string
  url: string
  sourceName: string
  sourceType: 'rss' | 'newsapi' | 'scraper'
  publishedAt: Date
  excerpt: string
  imageUrl?: string
}

export function makeItemId(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex').slice(0, 16)
}

// Source-agnostic interface — every source returns RawItem[]
export type SourceFetcher = () => Promise<RawItem[]>

// Default curated source list — editable via admin
export const DEFAULT_SOURCES = [
  { name: 'TechCrunch AI', type: 'RSS' as const, url: 'https://techcrunch.com/category/artificial-intelligence/feed/', enabled: true, weight: 1.2 },
  { name: 'The Verge AI', type: 'RSS' as const, url: 'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml', enabled: true, weight: 1.1 },
  { name: 'MIT Technology Review', type: 'RSS' as const, url: 'https://www.technologyreview.com/feed/', enabled: true, weight: 1.3 },
  { name: 'VentureBeat AI', type: 'RSS' as const, url: 'https://venturebeat.com/category/ai/feed/', enabled: true, weight: 1.1 },
  { name: 'Ars Technica AI', type: 'RSS' as const, url: 'https://feeds.arstechnica.com/arstechnica/technology-lab', enabled: true, weight: 1.0 },
  { name: 'Wired AI', type: 'RSS' as const, url: 'https://www.wired.com/feed/category/artificial-intelligence/latest/rss', enabled: true, weight: 1.1 },
  { name: 'OpenAI Blog', type: 'RSS' as const, url: 'https://openai.com/blog/rss.xml', enabled: true, weight: 1.4 },
  { name: 'Anthropic Blog', type: 'RSS' as const, url: 'https://www.anthropic.com/news.rss', enabled: true, weight: 1.4 },
  { name: 'Google DeepMind', type: 'RSS' as const, url: 'https://deepmind.google/blog/rss.xml', enabled: true, weight: 1.3 },
  { name: 'Hugging Face', type: 'RSS' as const, url: 'https://huggingface.co/blog/feed.xml', enabled: true, weight: 1.2 },
  { name: 'NewsAPI AI', type: 'NEWS_API' as const, url: 'https://newsapi.org/v2/everything', enabled: true, weight: 1.0 },
]
