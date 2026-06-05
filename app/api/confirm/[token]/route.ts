import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendWelcomeEmail } from '@/lib/email/send'

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const subscriber = await db.subscriber.findUnique({ where: { confirmToken: token } })

  if (!subscriber) {
    return NextResponse.redirect(new URL('/confirm/invalid', process.env.NEXT_PUBLIC_SITE_URL!))
  }

  if (subscriber.status === 'CONFIRMED') {
    return NextResponse.redirect(new URL('/confirm/already', process.env.NEXT_PUBLIC_SITE_URL!))
  }

  await db.subscriber.update({
    where: { id: subscriber.id },
    data: { status: 'CONFIRMED', confirmedAt: new Date(), confirmToken: null },
  })

  await sendWelcomeEmail(subscriber.email, subscriber.unsubscribeToken)

  return NextResponse.redirect(new URL('/confirm/success', process.env.NEXT_PUBLIC_SITE_URL!))
}
