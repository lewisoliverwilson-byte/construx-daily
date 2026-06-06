import { config } from 'dotenv'
config({ path: '.env.local' })
import { ingestAll } from '../lib/pipeline/ingest'
import { filterSeen, clusterByStory, markSeen } from '../lib/pipeline/dedupe'
import { rankAndSection, selectForIssue } from '../lib/pipeline/rank'
import { summariseAll, generateSubjectLine } from '../lib/pipeline/summarise'
import { assembleIssue } from '../lib/pipeline/assemble'

async function main() {
  console.log('[compile] Starting pipeline...')

  const raw = await ingestAll()
  console.log(`[compile] Ingested ${raw.length} raw items`)

  const fresh = await filterSeen(raw)
  console.log(`[compile] ${fresh.length} items after seen filter`)

  const clustered = clusterByStory(fresh)
  console.log(`[compile] ${clustered.length} clusters`)

  const scored = rankAndSection(clustered)
  const selected = selectForIssue(scored)
  console.log(`[compile] Selected ${selected.length} items for issue`)

  const summarised = await summariseAll(selected)
  console.log('[compile] Summarisation complete')

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  const { subject, previewText } = await generateSubjectLine(summarised, dateStr)
  console.log(`[compile] Subject: ${subject}`)

  const issueId = await assembleIssue(summarised, subject, previewText, today)
  await markSeen(selected)

  console.log(`[compile] Done — issue ID: ${issueId}`)
  process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
