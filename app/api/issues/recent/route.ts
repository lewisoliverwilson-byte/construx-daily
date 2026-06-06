import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const revalidate = 300 // 5-minute cache

export async function GET() {
  const issues = await db.issue.findMany({
    where: { status: 'SENT' },
    orderBy: { date: 'desc' },
    take: 3,
    include: {
      items: {
        orderBy: [{ section: 'asc' }, { position: 'asc' }],
      },
    },
  })

  return NextResponse.json(issues)
}
