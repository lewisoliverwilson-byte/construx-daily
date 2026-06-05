import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { issueId, hold } = await req.json()

  const issue = await db.issue.update({
    where: { id: issueId },
    data: { held: hold, status: hold ? 'HELD' : 'DRAFT' },
  })

  return NextResponse.json(issue)
}

// Manual send from admin
export async function PUT(req: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { issueId } = await req.json()
  const { sendIssue } = await import('@/lib/email/send')
  const sent = await sendIssue(issueId)
  return NextResponse.json({ ok: true, sent })
}
