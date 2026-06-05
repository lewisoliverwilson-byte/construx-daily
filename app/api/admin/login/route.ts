import { NextResponse } from 'next/server'
import { setAdminSession, clearAdminSession } from '@/lib/auth'

export async function POST(req: Request) {
  const { password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  return setAdminSession(res)
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  return clearAdminSession(res)
}
