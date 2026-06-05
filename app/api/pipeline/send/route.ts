import { NextResponse } from 'next/server'
import { isPipelineAuthorized } from '@/lib/auth'
import { sendIssue } from '@/lib/email/send'
import { db } from '@/lib/db'
import { format } from '@/lib/pipeline/utils'

export async function POST(req: Request) {
  if (!isPipelineAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const todaySlug = format(new Date(), 'yyyy-MM-dd')

  const issue = await db.issue.findUnique({ where: { slug: todaySlug } })

  if (!issue) {
    return NextResponse.json({ error: `No issue found for ${todaySlug}` }, { status: 404 })
  }

  if (issue.status === 'SENT') {
    return NextResponse.json({ error: 'Already sent' }, { status: 409 })
  }

  if (issue.held) {
    return NextResponse.json({ error: 'Issue is held — release it from the admin dashboard first' }, { status: 409 })
  }

  const sent = await sendIssue(issue.id)
  return NextResponse.json({ ok: true, sent })
}
