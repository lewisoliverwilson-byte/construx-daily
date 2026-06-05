import { db } from '@/lib/db'
import Link from 'next/link'
import { formatDisplayDate } from '@/lib/pipeline/utils'

export const revalidate = 3600

export default async function ArchivePage() {
  const issues = await db.issue.findMany({
    where: { status: 'SENT' },
    orderBy: { date: 'desc' },
    take: 50,
    select: { id: true, slug: true, date: true, subject: true, previewText: true, sendCount: true },
  })

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-amber-500 font-bold text-lg tracking-tight">Construx Daily</Link>
          <Link href="/" className="bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] font-bold px-4 py-2 rounded-lg text-xs transition-colors">
            Subscribe free
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold mb-2">Archive</h1>
        <p className="text-gray-400 text-sm mb-10">Every issue, searchable and shareable.</p>

        {issues.length === 0 ? (
          <p className="text-gray-500">No issues published yet. Check back tomorrow morning.</p>
        ) : (
          <div className="space-y-3">
            {issues.map(issue => (
              <Link
                key={issue.id}
                href={`/archive/${issue.slug}`}
                className="flex items-start gap-4 p-4 border border-white/5 rounded-lg hover:border-amber-500/20 hover:bg-white/[0.02] transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-gray-500 text-xs mb-1">{formatDisplayDate(new Date(issue.date))}</p>
                  <p className="text-white font-semibold text-sm group-hover:text-amber-400 transition-colors truncate">{issue.subject}</p>
                  {issue.previewText && (
                    <p className="text-gray-500 text-xs mt-1 truncate">{issue.previewText}</p>
                  )}
                </div>
                <span className="text-gray-600 text-xs mt-1 shrink-0">→</span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
