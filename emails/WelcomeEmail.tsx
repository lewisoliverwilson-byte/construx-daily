import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Font } from '@react-email/components'

interface Props {
  unsubscribeUrl: string
}

export function WelcomeEmailTemplate({ unsubscribeUrl }: Props) {
  return (
    <Html>
      <Head>
        <Font fontFamily="Space Grotesk" fallbackFontFamily="Arial"
          webFont={{ url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gozuPTPgqWlZwJo4qFB.woff2', format: 'woff2' }}
          fontWeight={400} fontStyle="normal" />
      </Head>
      <Preview>You&apos;re in. Your first AI briefing lands tomorrow at 8am.</Preview>
      <Body style={{ backgroundColor: '#0a0a0a', fontFamily: "'Space Grotesk', Arial, sans-serif" }}>
        <Container style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 24px' }}>
          <Text style={{ color: '#F59E0B', fontSize: '20px', fontWeight: '700', margin: '0 0 24px' }}>
            Construx Daily
          </Text>
          <Heading style={{ color: '#f9fafb', fontSize: '22px', fontWeight: '600', margin: '0 0 12px' }}>
            You&apos;re subscribed.
          </Heading>
          <Text style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' }}>
            Every morning at 8am, you&apos;ll get the day&apos;s most important AI news in bite-sized chunks.
            No fluff, no filler — just the stories that matter, summarised fast.
          </Text>
          <Text style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', margin: '0 0 28px' }}>
            Your first issue lands tomorrow. In the meantime, browse{' '}
            <Link href={`${process.env.NEXT_PUBLIC_SITE_URL}/archive`} style={{ color: '#F59E0B' }}>past issues</Link>{' '}
            to see what you&apos;re in for.
          </Text>
          <Text style={{ color: '#4b5563', fontSize: '12px', lineHeight: '1.5' }}>
            Changed your mind?{' '}
            <Link href={unsubscribeUrl} style={{ color: '#6b7280' }}>Unsubscribe here</Link>.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
