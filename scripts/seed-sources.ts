import { PrismaClient } from '@prisma/client'
import { DEFAULT_SOURCES } from '../lib/pipeline/sources'

const db = new PrismaClient()

async function main() {
  console.log('Seeding sources...')
  const existing = await db.source.count()
  if (existing > 0) {
    console.log(`${existing} sources already exist — skipping seed.`)
    return
  }
  await db.source.createMany({ data: DEFAULT_SOURCES })
  console.log(`Seeded ${DEFAULT_SOURCES.length} sources.`)
}

main().catch(console.error).finally(() => db.$disconnect())
