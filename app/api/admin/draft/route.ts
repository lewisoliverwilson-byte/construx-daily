import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/auth'
import { db } from '@/lib/db'

// Update an item in a draft issue
export async function PATCH(req: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId, summary, whyMatters, title } = await req.json()

  const item = await db.issueItem.update({
    where: { id: itemId },
    data: {
      ...(summary !== undefined && { summary }),
      ...(whyMatters !== undefined && { whyMatters }),
      ...(title !== undefined && { title }),
    },
  })

  return NextResponse.json(item)
}

// Delete an item from a draft issue
export async function DELETE(req: Request) {
  if (!await getAdminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { itemId } = await req.json()
  await db.issueItem.delete({ where: { id: itemId } })
  return NextResponse.json({ ok: true })
}
