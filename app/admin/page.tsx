import { db } from '@/lib/db'
import { format } from '@/lib/pipeline/utils'
import DraftEditor from './DraftEditor'

export const dynamic = 'force-dynamic'

export default async function AdminDraftPage() {
  const todaySlug = format(new Date(), 'yyyy-MM-dd')

  const issue = await db.issue.findUnique({
    where: { slug: todaySlug },
    include: { items: { orderBy: [{ section: 'asc' }, { position: 'asc' }] } },
  })

  const subscriberCount = await db.subscriber.count({ where: { status: 'CONFIRMED' } })

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Today&apos;s Draft</h1>
          <p className="text-gray-500 text-xs mt-0.5">{todaySlug} · {subscriberCount} confirmed subscribers</p>
        </div>
        {issue && (
          <span className={`text-xs font-semibold px-2 py-1 rounded ${
            issue.status === 'SENT' ? 'bg-green-500/10 text-green-400' :
            issue.status === 'HELD' ? 'bg-orange-500/10 text-orange-400' :
            'bg-gray-500/10 text-gray-400'
          }`}>
            {issue.status}
          </span>
        )}
      </div>

      {!issue ? (
        <div className="border border-white/5 rounded-xl p-8 text-center">
          <p className="text-gray-500 mb-2">No issue compiled yet for today.</p>
          <p className="text-gray-600 text-xs">The pipeline runs automatically each morning. You can also trigger it manually:</p>
          <CompileButton />
        </div>
      ) : (
        <DraftEditor issue={issue} />
      )}
    </main>
  )
}

function CompileButton() {
  async function trigger() {
    'use server'
    await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/pipeline/compile`, {
      method: 'POST',
      headers: { 'x-pipeline-secret': process.env.PIPELINE_SECRET! },
    })
  }
  return (
    <form action={trigger} className="mt-4">
      <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] font-bold px-5 py-2 rounded-lg text-sm transition-colors">
        Compile now
      </button>
    </form>
  )
}
