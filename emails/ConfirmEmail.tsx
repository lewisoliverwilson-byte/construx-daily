import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Font } from '@react-email/components'

interface Props {
  confirmUrl: string
}

export function ConfirmEmailTemplate({ confirmUrl }: Props) {
  return (
    <Html>
      <Head>
        <Font fontFamily="Space Grotesk" fallbackFontFamily="Arial"
          webFont={{ url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gozuPTPgqWlZwJo4qFB.woff2', format: 'woff2' }}
          fontWeight={400} fontStyle="normal" />
      </Head>
      <Preview>One click to confirm your Construx Daily subscription.</Preview>
      <Body style={{ backgroundColor: '#0a0a0a', fontFamily: "'Space Grotesk', Arial, sans-serif" }}>
        <Container style={{ maxWidth: '480px', margin: '0 auto', padding: '48px 24px' }}>
          <Text style={{ color: '#F59E0B', fontSize: '20px', fontWeight: '700', margin: '0 0 24px' }}>
            Construx Daily
          </Text>
          <Heading style={{ color: '#f9fafb', fontSize: '22px', fontWeight: '600', margin: '0 0 12px' }}>
            Confirm your subscription
          </Heading>
          <Text style={{ color: '#9ca3af', fontSize: '15px', lineHeight: '1.6', margin: '0 0 28px' }}>
            Click the button below to confirm your email and start receiving your daily AI briefing.
          </Text>
          <Button
            href={confirmUrl}
            style={{
              backgroundColor: '#F59E0B', color: '#0a0a0a', fontSize: '15px',
              fontWeight: '700', padding: '14px 28px', borderRadius: '6px', textDecoration: 'none',
            }}
          >
            Confirm subscription
          </Button>
          <Text style={{ color: '#4b5563', fontSize: '12px', margin: '28px 0 0', lineHeight: '1.5' }}>
            If you didn&apos;t subscribe, you can ignore this email. No further emails will be sent.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
