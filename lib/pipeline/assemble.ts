import { db } from '../db'
import { SummarisedItem } from './summarise'
import { Section } from '@prisma/client'
import { format } from './utils'

const SECTION_ORDER: Section[] = [
  Section.BIG_ONE,
  Section.IN_BRIEF,
  Section.TOOLS,
  Section.RESEARCH,
  Section.MOVES,
]

export async function assembleIssue(
  items: SummarisedItem[],
  subject: string,
  previewText: string,
  date: Date
): Promise<string> {
  const slug = format(date, 'yyyy-MM-dd')

  const existing = await db.issue.findUnique({ where: { slug } })
  if (existing) {
    console.log(`[assemble] Issue ${slug} already exists — skipping`)
    return existing.id
  }

  const sortedItems = SECTION_ORDER.flatMap(section => {
    return items
      .filter(i => i.section === section)
      .map((item, idx) => ({
        section,
        position: idx,
        title: item.title,
        summary: item.summary,
        whyMatters: item.whyMatters,
        sourceUrl: item.url,
        sourceName: item.sourceName,
        originalTitle: item.title,
      }))
  })

  const issue = await db.issue.create({
    data: {
      slug,
      date,
      subject,
      previewText,
      status: 'DRAFT',
      items: { create: sortedItems },
    },
  })

  console.log(`[assemble] Created issue ${slug} with ${sortedItems.length} items`)
  return issue.id
}
