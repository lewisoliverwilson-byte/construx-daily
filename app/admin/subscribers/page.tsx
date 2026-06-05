import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function SubscribersPage() {
  const [total, confirmed, pending, unsubscribed] = await Promise.all([
    db.subscriber.count(),
    db.subscriber.count({ where: { status: 'CONFIRMED' } }),
    db.subscriber.count({ where: { status: 'PENDING' } }),
    db.subscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
  ])

  const recentSubs = await db.subscriber.findMany({
    where: { status: 'CONFIRMED' },
    orderBy: { confirmedAt: 'desc' },
    take: 25,
    select: { email: true, confirmedAt: true },
  })

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-xl font-bold mb-6">Subscribers</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { label: 'Confirmed', value: confirmed, color: 'text-green-400' },
          { label: 'Pending', value: pending, color: 'text-yellow-400' },
          { label: 'Unsubscribed', value: unsubscribed, color: 'text-gray-400' },
          { label: 'Total', value: total, color: 'text-white' },
        ].map(stat => (
          <div key={stat.label} className="border border-white/5 rounded-xl p-4">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-gray-500 text-xs mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-gray-400 mb-3">Recent confirmed subscribers</h2>
      <div className="space-y-1">
        {recentSubs.map(sub => (
          <div key={sub.email} className="flex items-center justify-between border border-white/5 rounded-lg px-4 py-2.5">
            <span className="text-sm text-gray-300">{sub.email}</span>
            <span className="text-xs text-gray-600">
              {sub.confirmedAt ? new Date(sub.confirmedAt).toLocaleDateString('en-GB') : '—'}
            </span>
          </div>
        ))}
      </div>
    </main>
  )
}
