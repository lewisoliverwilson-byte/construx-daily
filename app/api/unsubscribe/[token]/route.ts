import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const subscriber = await db.subscriber.findUnique({ where: { unsubscribeToken: token } })

  if (!subscriber) {
    return NextResponse.redirect(new URL('/unsubscribe/invalid', process.env.NEXT_PUBLIC_SITE_URL!))
  }

  await db.subscriber.update({
    where: { id: subscriber.id },
    data: { status: 'UNSUBSCRIBED' },
  })

  return NextResponse.redirect(new URL('/unsubscribe/success', process.env.NEXT_PUBLIC_SITE_URL!))
}
