import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendConfirmationEmail } from '@/lib/email/send'

export async function POST(req: Request) {
  const { email } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const normalised = email.toLowerCase().trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(normalised)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  const existing = await db.subscriber.findUnique({ where: { email: normalised } })

  if (existing?.status === 'CONFIRMED') {
    // Don't reveal they're already subscribed — same response for privacy
    return NextResponse.json({ ok: true })
  }

  if (existing?.status === 'PENDING') {
    // Resend confirmation
    await sendConfirmationEmail(normalised, existing.confirmToken!)
    return NextResponse.json({ ok: true })
  }

  const token = crypto.randomUUID()

  await db.subscriber.upsert({
    where: { email: normalised },
    create: { email: normalised, status: 'PENDING', confirmToken: token },
    update: { status: 'PENDING', confirmToken: token },
  })

  await sendConfirmationEmail(normalised, token)

  return NextResponse.json({ ok: true })
}
