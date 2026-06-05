import Parser from 'rss-parser'
import { RawItem, makeItemId } from './sources'
import { db } from '../db'

type RssItem = {
  link?: string
  title?: string
  pubDate?: string
  contentSnippet?: string
  content?: string
  summary?: string
  enclosure?: { url?: string; type?: string }
  mediaContent?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>
  mediaThumbnail?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>
}

const rssParser = new Parser<object, RssItem>({
  timeout: 10000,
  headers: { 'User-Agent': 'ConstruxDaily/1.0 (newsletter bot; contact@construxgroup.com)' },
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
    ],
  },
})

function extractRssImage(item: RssItem): string | undefined {
  // enclosure (e.g. podcast/RSS image attachments)
  if (item.enclosure?.url && item.enclosure.type?.startsWith('image/')) {
    const u = item.enclosure.url
    if (u.startsWith('https://')) return u
  }
  // media:content
  const mc = Array.isArray(item.mediaContent) ? item.mediaContent[0] : item.mediaContent
  const mcUrl = mc?.$?.url
  if (mcUrl?.startsWith('https://')) return mcUrl
  // media:thumbnail
  const mt = Array.isArray(item.mediaThumbnail) ? item.mediaThumbnail[0] : item.mediaThumbnail
  const mtUrl = mt?.$?.url
  if (mtUrl?.startsWith('https://')) return mtUrl

  return undefined
}

async function fetchRssFeed(name: string, url: string): Promise<RawItem[]> {
  try {
    const feed = await rssParser.parseURL(url)
    const cutoff = new Date(Date.now() - 36 * 60 * 60 * 1000)

    return feed.items
      .filter(item => item.link && item.title)
      .map(item => {
        const pubDate = item.pubDate ? new Date(item.pubDate) : new Date()
        return {
          id: makeItemId(item.link!),
          title: item.title!.trim(),
          url: item.link!,
          sourceName: name,
          sourceType: 'rss' as const,
          publishedAt: pubDate,
          excerpt: stripHtml(item.contentSnippet || item.content || item.summary || '').slice(0, 500),
          imageUrl: extractRssImage(item),
        }
      })
      .filter(item => item.publishedAt >= cutoff)
  } catch (err) {
    console.error(`[ingest] RSS failed for ${name}: ${err}`)
    return []
  }
}

async function fetchNewsApi(apiKey: string): Promise<RawItem[]> {
  try {
    const cutoff = new Date(Date.now() - 36 * 60 * 60 * 1000)
    const from = cutoff.toISOString().split('T')[0]

    const params = new URLSearchParams({
      q: '(artificial intelligence OR machine learning OR LLM OR "large language model" OR "AI model" OR "generative AI")',
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: '50',
      from,
      apiKey,
    })

    const res = await fetch(`https://newsapi.org/v2/everything?${params}`, {
      headers: { 'User-Agent': 'ConstruxDaily/1.0' },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      console.error(`[ingest] NewsAPI ${res.status}: ${await res.text()}`)
      return []
    }

    interface NewsApiArticle {
      url: string
      title: string
      description?: string
      publishedAt: string
      source: { name: string }
      urlToImage?: string
    }
    const data = await res.json()
    return (data.articles as NewsApiArticle[] || [])
      .filter(a => a.url && a.title && a.source?.name)
      .map(a => ({
        id: makeItemId(a.url),
        title: a.title.trim(),
        url: a.url,
        sourceName: a.source.name,
        sourceType: 'newsapi' as const,
        publishedAt: new Date(a.publishedAt),
        excerpt: (a.description || '').slice(0, 500),
        imageUrl: (a.urlToImage && a.urlToImage.startsWith('https://')) ? a.urlToImage : undefined,
      }))
  } catch (err) {
    console.error(`[ingest] NewsAPI failed: ${err}`)
    return []
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
}

export async function ingestAll(): Promise<RawItem[]> {
  const sources = await db.source.findMany({ where: { enabled: true } })

  const fetches: Promise<RawItem[]>[] = []

  for (const source of sources) {
    if (source.type === 'RSS') {
      fetches.push(fetchRssFeed(source.name, source.url))
    } else if (source.type === 'NEWS_API') {
      fetches.push(fetchNewsApi(process.env.NEWS_API_KEY!))
    }
  }

  const results = await Promise.all(fetches)
  const all = results.flat()

  await db.source.updateMany({
    where: { enabled: true },
    data: { lastFetched: new Date() },
  })

  return all
}
