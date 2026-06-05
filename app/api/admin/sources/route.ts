import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const sources = await db.source.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(sources)
}

export async function POST(req: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { name, type, url, weight } = await req.json()
  const source = await db.source.create({ data: { name, type, url, weight: weight ?? 1.0 } })
  return NextResponse.json(source)
}

export async function PATCH(req: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, enabled, weight } = await req.json()
  const source = await db.source.update({
    where: { id },
    data: { ...(enabled !== undefined && { enabled }), ...(weight !== undefined && { weight }) },
  })
  return NextResponse.json(source)
}

export async function DELETE(req: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await req.json()
  await db.source.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
