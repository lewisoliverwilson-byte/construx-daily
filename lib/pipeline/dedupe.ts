import stringSimilarity from 'string-similarity'
import { RawItem } from './sources'
import { db } from '../db'

const TITLE_SIMILARITY_THRESHOLD = 0.72

export interface ClusteredItem extends RawItem {
  alternativeSources: Array<{ sourceName: string; url: string }>
}

// Remove items whose URLs we've seen in previous issues
export async function filterSeen(items: RawItem[]): Promise<RawItem[]> {
  if (items.length === 0) return []

  const urls = items.map(i => i.url)
  const seen = await db.seenUrl.findMany({
    where: { url: { in: urls } },
    select: { url: true },
  })
  const seenSet = new Set(seen.map(s => s.url))
  return items.filter(i => !seenSet.has(i.url))
}

// Cluster items by title similarity — same story from different sources becomes one item
export function clusterByStory(items: RawItem[]): ClusteredItem[] {
  const clusters: ClusteredItem[] = []
  const used = new Set<string>()

  // Sort by source weight signal: prefer items with excerpts
  const sorted = [...items].sort((a, b) => (b.excerpt.length - a.excerpt.length))

  for (const item of sorted) {
    if (used.has(item.id)) continue

    const cluster: ClusteredItem = {
      ...item,
      alternativeSources: [],
    }

    for (const other of sorted) {
      if (other.id === item.id || used.has(other.id)) continue
      const sim = stringSimilarity.compareTwoStrings(
        normaliseTitle(item.title),
        normaliseTitle(other.title)
      )
      if (sim >= TITLE_SIMILARITY_THRESHOLD) {
        cluster.alternativeSources.push({ sourceName: other.sourceName, url: other.url })
        used.add(other.id)
      }
    }

    used.add(item.id)
    clusters.push(cluster)
  }

  return clusters
}

function normaliseTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
}

export async function markSeen(items: RawItem[]): Promise<void> {
  if (items.length === 0) return
  await db.seenUrl.createMany({
    data: items.map(i => ({ url: i.url })),
    skipDuplicates: true,
  })
}
