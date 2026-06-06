import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendConfirmationEmail } from '@/lib/email/send'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const normalised = email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalised)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const existing = await db.subscriber.findUnique({ where: { email: normalised } })

    if (existing?.status === 'CONFIRMED') {
      return NextResponse.json({ ok: true })
    }

    let token: string

    if (existing?.status === 'PENDING') {
      token = existing.confirmToken!
    } else {
      token = crypto.randomUUID()
      await db.subscriber.upsert({
        where: { email: normalised },
        create: { email: normalised, status: 'PENDING', confirmToken: token },
        update: { status: 'PENDING', confirmToken: token },
      })
    }

    try {
      await sendConfirmationEmail(normalised, token)
    } catch (emailErr) {
      // Log but don't fail — subscriber is saved; email can be retried
      console.error('[subscribe] Confirmation email failed:', emailErr)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[subscribe] Unexpected error:', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
