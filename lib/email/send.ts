import { Resend } from 'resend'
import { db } from '../db'
import { IssueEmailTemplate } from '../../emails/IssueEmail'
import { ConfirmEmailTemplate } from '../../emails/ConfirmEmail'
import { WelcomeEmailTemplate } from '../../emails/WelcomeEmail'
import { IssueItem } from '@prisma/client'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? 'Construx Daily <daily@construxdaily.com>'
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? 'hello@construxdaily.com'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export async function sendConfirmationEmail(email: string, token: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: 'Confirm your subscription to Construx Daily',
    react: ConfirmEmailTemplate({ confirmUrl: `${SITE_URL}/confirm/${token}` }),
  })
}

export async function sendWelcomeEmail(email: string, unsubscribeToken: string) {
  await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: REPLY_TO,
    subject: 'Welcome to Construx Daily',
    react: WelcomeEmailTemplate({
      unsubscribeUrl: `${SITE_URL}/unsubscribe/${unsubscribeToken}`,
    }),
  })
}

export async function sendIssue(issueId: string): Promise<number> {
  const issue = await db.issue.findUniqueOrThrow({
    where: { id: issueId },
    include: { items: { orderBy: [{ section: 'asc' }, { position: 'asc' }] } },
  })

  const subscribers = await db.subscriber.findMany({
    where: { status: 'CONFIRMED' },
  })

  if (subscribers.length === 0) {
    console.log('[send] No confirmed subscribers')
    return 0
  }

  const archiveUrl = `${SITE_URL}/archive/${issue.slug}`
  let sent = 0
  const BATCH_SIZE = 50

  for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
    const batch = subscribers.slice(i, i + BATCH_SIZE)

    await Promise.all(batch.map(async (sub) => {
      try {
        await resend.emails.send({
          from: FROM,
          to: sub.email,
          replyTo: REPLY_TO,
          subject: issue.subject,
          react: IssueEmailTemplate({
            subject: issue.subject,
            previewText: issue.previewText,
            items: issue.items as IssueItem[],
            archiveUrl,
            unsubscribeUrl: `${SITE_URL}/unsubscribe/${sub.unsubscribeToken}`,
          }),
        })
        sent++
      } catch (err) {
        console.error(`[send] Failed for ${sub.email}: ${err}`)
      }
    }))

    // Small delay between batches
    if (i + BATCH_SIZE < subscribers.length) {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  await db.issue.update({
    where: { id: issueId },
    data: { status: 'SENT', sentAt: new Date(), sendCount: sent },
  })

  return sent
}
