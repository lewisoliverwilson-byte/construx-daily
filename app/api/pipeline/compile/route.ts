import { NextResponse } from 'next/server'
import { isPipelineAuthorized } from '@/lib/auth'
import { ingestAll } from '@/lib/pipeline/ingest'
import { filterSeen, clusterByStory, markSeen } from '@/lib/pipeline/dedupe'
import { rankAndSection, selectForIssue } from '@/lib/pipeline/rank'
import { summariseAll, generateSubjectLine } from '@/lib/pipeline/summarise'
import { assembleIssue } from '@/lib/pipeline/assemble'

export async function POST(req: Request) {
  if (!isPipelineAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[pipeline] Starting compile...')

    const raw = await ingestAll()
    console.log(`[pipeline] Ingested ${raw.length} raw items`)

    const fresh = await filterSeen(raw)
    console.log(`[pipeline] ${fresh.length} items after seen filter`)

    const clustered = clusterByStory(fresh)
    console.log(`[pipeline] ${clustered.length} clusters`)

    const scored = rankAndSection(clustered)
    const selected = selectForIssue(scored)
    console.log(`[pipeline] Selected ${selected.length} items for issue`)

    const summarised = await summariseAll(selected)
    console.log('[pipeline] Summarisation complete')

    const today = new Date()
    const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    const { subject, previewText } = await generateSubjectLine(summarised, dateStr)

    const issueId = await assembleIssue(summarised, subject, previewText, today)

    // Mark all selected items as seen to prevent repetition tomorrow
    await markSeen(selected)

    return NextResponse.json({ ok: true, issueId })
  } catch (err) {
    console.error('[pipeline] Compile failed:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
