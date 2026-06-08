import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDisplayDate } from '@/lib/pipeline/utils'
import { Section } from '@prisma/client'
import type { Metadata } from 'next'

export const revalidate = 3600

const C = {
  cream:    '#FAF8F2',
  creamAlt: '#F0EBE0',
  ink:      '#0F0D0A',
  ink2:     '#5C5347',
  ink3:     '#9B9186',
  cobalt:   '#1A4ED8',
  signal:   '#F97316',
  border:   '#E4DDD1',
  card:     '#FFFFFF',
}

const SECTION_LABELS: Record<Section, string> = {
  BIG_ONE:  'The Big One',
  IN_BRIEF: 'In Brief',
  TOOLS:    'New Tools & Launches',
  RESEARCH: 'Research Worth Knowing',
  MOVES:    'Moves & Money',
}

const SECTION_COLORS: Record<Section, string> = {
  BIG_ONE:  C.cobalt,
  IN_BRIEF: '#0891B2',
  TOOLS:    '#059669',
  RESEARCH: '#7C3AED',
  MOVES:    C.signal,
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
    <div style={{ minHeight: '100vh', background: C.cream, color: C.ink, fontFamily: "'Space Grotesk', Arial, sans-serif" }}>

      <nav style={{
        borderBottom: `1px solid ${C.border}`,
        padding: '13px 40px',
        background: 'rgba(250,248,242,0.92)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ color: C.cobalt, fontWeight: 800, fontSize: '16px', textDecoration: 'none', letterSpacing: '-0.4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.cobalt, display: 'inline-block' }} />
            Construx Daily
          </Link>
          <Link href="/archive" style={{ color: C.ink3, fontSize: '14px', fontWeight: 500, textDecoration: 'none' }}>← Archive</Link>
        </div>
      </nav>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 40px 80px' }}>

        {/* Issue header */}
        <header style={{ marginBottom: '40px', paddingBottom: '32px', borderBottom: `1px solid ${C.border}` }}>
          <p style={{ fontSize: '11px', fontWeight: 700, color: C.signal, textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '12px' }}>
            {formatDisplayDate(new Date(issue.date))}
          </p>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 900, letterSpacing: '-1px', color: C.ink, margin: '0 0 10px', lineHeight: 1.2 }}>
            {issue.subject}
          </h1>
          {issue.previewText && (
            <p style={{ color: C.ink3, fontSize: '15px', margin: 0, lineHeight: 1.6 }}>{issue.previewText}</p>
          )}
        </header>

        {/* Sections */}
        {SECTION_ORDER.map(section => {
          const items = grouped[section]
          if (!items) return null
          return (
            <section key={section} style={{ marginBottom: '40px' }}>
              <h2 style={{
                fontSize: '10px', fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.2em', color: SECTION_COLORS[section],
                marginBottom: '20px', paddingBottom: '8px',
                borderBottom: `2px solid ${SECTION_COLORS[section]}22`,
              }}>
                {SECTION_LABELS[section]}
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {items.map((item, idx) => (
                  <article key={item.id} style={{
                    paddingBottom: '24px', marginBottom: '24px',
                    borderBottom: idx < items.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                    {/* Hero image for BIG_ONE */}
                    {section === 'BIG_ONE' && item.imageUrl && (
                      <div style={{ width: '100%', height: '240px', borderRadius: '12px', overflow: 'hidden', marginBottom: '16px', background: C.creamAlt }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}

                    {/* Thumbnail + text for other sections */}
                    {section !== 'BIG_ONE' && item.imageUrl ? (
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ width: '96px', height: '68px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: C.creamAlt }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '16px', fontWeight: 700, color: C.ink, textDecoration: 'none', lineHeight: 1.35, display: 'block', marginBottom: '6px' }}>
                            {item.title}
                          </a>
                          <p style={{ color: C.ink2, fontSize: '14px', lineHeight: 1.6, margin: '0 0 8px' }}>{item.summary}</p>
                          {item.whyMatters && (
                            <p style={{ color: C.ink3, fontSize: '13px', lineHeight: 1.5, margin: '0 0 8px' }}>
                              <span style={{ color: C.cobalt, fontWeight: 700 }}>Why it matters: </span>
                              {item.whyMatters}
                            </p>
                          )}
                          <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: C.ink3, textDecoration: 'none', fontWeight: 500 }}>
                            via {item.sourceName} →
                          </a>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '17px', fontWeight: 700, color: C.ink, textDecoration: 'none', lineHeight: 1.35, display: 'block', marginBottom: '8px' }}>
                          {item.title}
                        </a>
                        <p style={{ color: C.ink2, fontSize: '15px', lineHeight: 1.7, margin: '0 0 10px' }}>{item.summary}</p>
                        {item.whyMatters && (
                          <p style={{ color: C.ink3, fontSize: '14px', lineHeight: 1.55, margin: '0 0 10px' }}>
                            <span style={{ color: C.cobalt, fontWeight: 700 }}>Why it matters: </span>
                            {item.whyMatters}
                          </p>
                        )}
                        <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: C.ink3, textDecoration: 'none', fontWeight: 500 }}>
                          via {item.sourceName} →
                        </a>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )
        })}

        {/* Subscribe CTA */}
        <div style={{
          border: `1px solid rgba(26,78,216,0.18)`,
          background: 'rgba(26,78,216,0.04)',
          borderRadius: '16px', padding: '32px', textAlign: 'center', marginTop: '16px',
        }}>
          <p style={{ fontWeight: 800, color: C.cobalt, margin: '0 0 6px', fontSize: '18px' }}>Get this every morning.</p>
          <p style={{ color: C.ink3, fontSize: '14px', margin: '0 0 20px', lineHeight: 1.5 }}>Free. Bite-sized. No fluff.</p>
          <Link href="/" style={{
            display: 'inline-block', background: C.cobalt, color: '#fff',
            fontWeight: 800, fontSize: '14px', padding: '12px 28px',
            borderRadius: '10px', textDecoration: 'none',
            boxShadow: '0 4px 20px rgba(26,78,216,0.30)',
          }}>
            Subscribe free →
          </Link>
        </div>
      </main>
    </div>
  )
}
