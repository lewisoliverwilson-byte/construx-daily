import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDisplayDate } from '@/lib/pipeline/utils'
import { Section } from '@prisma/client'
import type { Metadata } from 'next'

export const revalidate = 3600

const SECTION_LABELS: Record<Section, string> = {
  BIG_ONE: 'The Big One',
  IN_BRIEF: 'In Brief',
  TOOLS: 'New Tools & Launches',
  RESEARCH: 'Research Worth Knowing',
  MOVES: 'Moves & Money',
}

const SECTION_ORDER: Section[] = ['BIG_ONE', 'IN_BRIEF', 'TOOLS', 'RESEARCH', 'MOVES']

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const issue = await db.issue.findUnique({ where: { slug }, select: { subject: true, previewText: true } })
  if (!issue) return {}
  return {
    title: `${issue.subject} — Construx Daily`,
    description: issue.previewText,
  }
}

export default async function IssuePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  const issue = await db.issue.findUnique({
    where: { slug },
    include: { items: { orderBy: [{ section: 'asc' }, { position: 'asc' }] } },
  })

  if (!issue) notFound()

  const grouped = SECTION_ORDER.reduce((acc, s) => {
    const items = issue.items.filter(i => i.section === s)
    if (items.length > 0) acc[s] = items
    return acc
  }, {} as Partial<Record<Section, typeof issue.items>>)

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-amber-500 font-bold text-lg tracking-tight">Construx Daily</Link>
          <Link href="/archive" className="text-gray-400 text-sm hover:text-white transition-colors">Archive</Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Issue header */}
        <header className="mb-10 pb-8 border-b border-white/5">
          <p className="text-amber-500 text-xs font-semibold uppercase tracking-widest mb-3">
            {formatDisplayDate(new Date(issue.date))}
          </p>
          <h1 className="text-2xl font-bold leading-tight mb-2">{issue.subject}</h1>
          {issue.previewText && (
            <p className="text-gray-400 text-sm">{issue.previewText}</p>
          )}
        </header>

        {/* Sections */}
        {SECTION_ORDER.map(section => {
          const items = grouped[section]
          if (!items) return null
          return (
            <section key={section} className="mb-10">
              <h2 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-5">
                {SECTION_LABELS[section]}
              </h2>
              <div className="space-y-6">
                {items.map(item => (
                  <article key={item.id} className="pb-6 border-b border-white/5 last:border-0">
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-semibold text-base hover:text-amber-400 transition-colors leading-snug block mb-2"
                    >
                      {item.title}
                    </a>
                    <p className="text-gray-300 text-sm leading-relaxed mb-2">{item.summary}</p>
                    {item.whyMatters && (
                      <p className="text-gray-500 text-sm italic mb-2">
                        <span className="text-amber-500 not-italic font-semibold">Why it matters:</span>{' '}
                        {item.whyMatters}
                      </p>
                    )}
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 text-xs hover:text-gray-400 transition-colors"
                    >
                      via {item.sourceName} →
                    </a>
                  </article>
                ))}
              </div>
            </section>
          )
        })}

        {/* Subscribe CTA */}
        <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-6 text-center mt-12">
          <p className="text-amber-400 font-semibold mb-1">Get this every morning.</p>
          <p className="text-gray-400 text-sm mb-4">Free. Bite-sized. No fluff.</p>
          <Link href="/" className="inline-block bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] font-bold px-6 py-2.5 rounded-lg text-sm transition-colors">
            Subscribe free →
          </Link>
        </div>
      </main>
    </div>
  )
}
