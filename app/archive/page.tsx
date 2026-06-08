import { db } from '@/lib/db'
import Link from 'next/link'
import { formatDisplayDate } from '@/lib/pipeline/utils'

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

export default async function ArchivePage() {
  const issues = await db.issue.findMany({
    where: { status: 'SENT' },
    orderBy: { date: 'desc' },
    take: 50,
    select: { id: true, slug: true, date: true, subject: true, previewText: true, sendCount: true },
  })

  return (
    <div style={{ minHeight: '100vh', background: C.cream, color: C.ink, fontFamily: "'Space Grotesk', Arial, sans-serif" }}>
      <nav style={{
        borderBottom: `1px solid ${C.border}`,
        padding: '13px 40px',
        background: 'rgba(250,248,242,0.92)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ color: C.cobalt, fontWeight: 800, fontSize: '16px', textDecoration: 'none', letterSpacing: '-0.4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.cobalt, display: 'inline-block' }} />
            Construx Daily
          </Link>
          <Link href="/" style={{
            background: C.cobalt, color: '#fff', fontWeight: 800, fontSize: '13px',
            padding: '8px 18px', borderRadius: '8px', textDecoration: 'none',
          }}>
            Subscribe free →
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '56px 40px 80px' }}>
        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.ink3, marginBottom: '10px' }}>
            Every issue
          </p>
          <h1 style={{ fontSize: '36px', fontWeight: 900, letterSpacing: '-2px', color: C.ink, margin: 0, lineHeight: 1.1 }}>Archive</h1>
          <p style={{ color: C.ink3, fontSize: '15px', marginTop: '10px' }}>Every issue, searchable and shareable.</p>
        </div>

        {issues.length === 0 ? (
          <p style={{ color: C.ink3 }}>No issues published yet. Check back tomorrow morning.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {issues.map(issue => (
              <Link
                key={issue.id}
                href={`/archive/${issue.slug}`}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  padding: '18px 20px',
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: '12px',
                  textDecoration: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onMouseEnter={undefined}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: C.signal, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>
                    {formatDisplayDate(new Date(issue.date))}
                  </p>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: C.ink, marginBottom: '4px', lineHeight: 1.35 }}>
                    {issue.subject}
                  </p>
                  {issue.previewText && (
                    <p style={{ fontSize: '13px', color: C.ink3, margin: 0, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {issue.previewText}
                    </p>
                  )}
                </div>
                <span style={{ color: C.cobalt, fontSize: '18px', marginTop: '2px', flexShrink: 0 }}>→</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
