import {
  Body, Container, Head, Heading, Hr, Html, Link, Preview,
  Section, Text, Row, Column, Font,
} from '@react-email/components'
import { IssueItem, Section as PrismaSection } from '@prisma/client'

interface Props {
  subject: string
  previewText: string
  items: IssueItem[]
  archiveUrl: string
  unsubscribeUrl: string
}

const SECTION_LABELS: Record<PrismaSection, string> = {
  BIG_ONE: 'The Big One',
  IN_BRIEF: 'In Brief',
  TOOLS: 'New Tools & Launches',
  RESEARCH: 'Research Worth Knowing',
  MOVES: 'Moves & Money',
}

const SECTION_ORDER: PrismaSection[] = ['BIG_ONE', 'IN_BRIEF', 'TOOLS', 'RESEARCH', 'MOVES']

export function IssueEmailTemplate({ subject, previewText, items, archiveUrl, unsubscribeUrl }: Props) {
  const grouped = SECTION_ORDER.reduce((acc, s) => {
    const sectionItems = items.filter(i => i.section === s)
    if (sectionItems.length > 0) acc[s] = sectionItems
    return acc
  }, {} as Partial<Record<PrismaSection, IssueItem[]>>)

  return (
    <Html>
      <Head>
        <Font
          fontFamily="Space Grotesk"
          fallbackFontFamily="Arial"
          webFont={{ url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gozuPTPgqWlZwJo4qFB.woff2', format: 'woff2' }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{previewText}</Preview>
      <Body style={body}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={logo}>Construx Daily</Text>
            <Text style={tagline}>Your bite-sized AI briefing</Text>
          </Section>

          <Hr style={divider} />

          {/* Sections */}
          {SECTION_ORDER.map(section => {
            const sectionItems = grouped[section]
            if (!sectionItems) return null
            return (
              <Section key={section} style={sectionWrapper}>
                <Text style={sectionLabel}>{SECTION_LABELS[section]}</Text>

                {sectionItems.map(item => (
                  <Section key={item.id} style={itemWrapper}>
                    <Link href={item.sourceUrl} style={itemTitle}>{item.title}</Link>
                    <Text style={itemSummary}>{item.summary}</Text>
                    {item.whyMatters && (
                      <Text style={whyText}>
                        <span style={{ color: '#F59E0B', fontWeight: '600' }}>Why it matters:</span>{' '}
                        {item.whyMatters}
                      </Text>
                    )}
                    <Text style={attribution}>via <Link href={item.sourceUrl} style={sourceLink}>{item.sourceName}</Link></Text>
                  </Section>
                ))}
              </Section>
            )
          })}

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Row>
              <Column>
                <Link href={archiveUrl} style={footerLink}>View in browser</Link>
                {' · '}
                <Link href={unsubscribeUrl} style={footerLink}>Unsubscribe</Link>
              </Column>
            </Row>
            <Text style={footerText}>
              Construx Group Ltd · London, UK<br />
              You&apos;re receiving this because you subscribed at construxdaily.com
            </Text>
            <Text style={footerDisclaimer}>
              Construx Daily writes original summaries of publicly available news stories.
              All sources are linked and attributed. We do not reproduce article text.
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

const body = { backgroundColor: '#0a0a0a', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto', padding: '0 16px' }
const header = { paddingTop: '32px', paddingBottom: '16px', textAlign: 'center' as const }
const logo = { color: '#F59E0B', fontSize: '24px', fontWeight: '700', margin: '0', letterSpacing: '-0.5px' }
const tagline = { color: '#6b7280', fontSize: '13px', margin: '4px 0 0' }
const divider = { borderColor: '#1f2937', margin: '8px 0' }
const sectionWrapper = { paddingTop: '20px' }
const sectionLabel = { color: '#F59E0B', fontSize: '11px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' as const, margin: '0 0 12px' }
const itemWrapper = { paddingBottom: '20px', borderBottom: '1px solid #1f2937', marginBottom: '20px' }
const itemTitle = { color: '#f9fafb', fontSize: '16px', fontWeight: '600', textDecoration: 'none', lineHeight: '1.4', display: 'block', marginBottom: '8px' }
const itemSummary = { color: '#d1d5db', fontSize: '14px', lineHeight: '1.6', margin: '0 0 8px' }
const whyText = { color: '#9ca3af', fontSize: '13px', lineHeight: '1.5', margin: '0 0 6px', fontStyle: 'italic' }
const attribution = { color: '#6b7280', fontSize: '12px', margin: '0' }
const sourceLink = { color: '#6b7280', textDecoration: 'underline' }
const footer = { paddingTop: '24px', paddingBottom: '32px', textAlign: 'center' as const }
const footerLink = { color: '#6b7280', fontSize: '12px', textDecoration: 'underline' }
const footerText = { color: '#4b5563', fontSize: '11px', margin: '12px 0 4px', lineHeight: '1.5' }
const footerDisclaimer = { color: '#374151', fontSize: '10px', margin: '8px 0 0', lineHeight: '1.4' }
