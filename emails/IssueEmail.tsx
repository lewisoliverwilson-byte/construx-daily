import {
  Body, Container, Head, Heading, Hr, Html, Img, Link, Preview,
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
            <Row>
              <Column style={{ textAlign: 'center' as const }}>
                <Text style={logo}>● Construx Daily</Text>
                <Text style={tagline}>Your bite-sized AI briefing</Text>
              </Column>
            </Row>
          </Section>

          <Hr style={divider} />

          {/* Sections */}
          {SECTION_ORDER.map(section => {
            const sectionItems = grouped[section]
            if (!sectionItems) return null
            const isBigOne = section === 'BIG_ONE'
            return (
              <Section key={section} style={sectionWrapper}>
                <Text style={sectionLabel}>{SECTION_LABELS[section]}</Text>

                {sectionItems.map(item => (
                  <Section key={item.id} style={itemWrapper}>

                    {/* Hero image for BIG_ONE */}
                    {isBigOne && item.imageUrl && (
                      <Img
                        src={item.imageUrl}
                        width="560"
                        alt={item.title}
                        style={heroImage}
                      />
                    )}

                    {/* Thumbnail + text layout for non-BIG_ONE */}
                    {!isBigOne && item.imageUrl ? (
                      <Row>
                        <Column style={{ width: '150px', paddingRight: '14px', verticalAlign: 'top' as const }}>
                          <Img
                            src={item.imageUrl}
                            width="150"
                            height="100"
                            alt={item.title}
                            style={thumbImage}
                          />
                        </Column>
                        <Column style={{ verticalAlign: 'top' as const }}>
                          <Link href={item.sourceUrl} style={itemTitle}>{item.title}</Link>
                          <Text style={itemSummary}>{item.summary}</Text>
                          {item.whyMatters && (
                            <Text style={whyText}>
                              <span style={{ color: '#d97706', fontWeight: '600' }}>Why it matters:</span>{' '}
                              {item.whyMatters}
                            </Text>
                          )}
                          <Text style={attribution}>via <Link href={item.sourceUrl} style={sourceLink}>{item.sourceName}</Link></Text>
                        </Column>
                      </Row>
                    ) : (
                      <>
                        <Link href={item.sourceUrl} style={isBigOne ? bigTitle : itemTitle}>{item.title}</Link>
                        <Text style={isBigOne ? bigSummary : itemSummary}>{item.summary}</Text>
                        {item.whyMatters && (
                          <Text style={whyText}>
                            <span style={{ color: '#d97706', fontWeight: '600' }}>Why it matters:</span>{' '}
                            {item.whyMatters}
                          </Text>
                        )}
                        <Text style={attribution}>via <Link href={item.sourceUrl} style={sourceLink}>{item.sourceName}</Link></Text>
                      </>
                    )}

                  </Section>
                ))}
              </Section>
            )
          })}

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Row>
              <Column style={{ textAlign: 'center' as const }}>
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

const body: React.CSSProperties = { backgroundColor: '#f4f4f0', fontFamily: "'Space Grotesk', Arial, sans-serif" }
const container: React.CSSProperties = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }
const header: React.CSSProperties = { paddingTop: '28px', paddingBottom: '16px', paddingLeft: '24px', paddingRight: '24px', textAlign: 'center' as const, backgroundColor: '#ffffff' }
const logo: React.CSSProperties = { color: '#111827', fontSize: '20px', fontWeight: '700', margin: '0', letterSpacing: '-0.3px' }
const tagline: React.CSSProperties = { color: '#9ca3af', fontSize: '12px', margin: '4px 0 0' }
const divider: React.CSSProperties = { borderColor: '#e5e7eb', margin: '0' }
const sectionWrapper: React.CSSProperties = { paddingTop: '20px', paddingLeft: '24px', paddingRight: '24px' }
const sectionLabel: React.CSSProperties = { color: '#d97706', fontSize: '10px', fontWeight: '700', letterSpacing: '1.5px', textTransform: 'uppercase' as const, margin: '0 0 10px' }
const itemWrapper: React.CSSProperties = { paddingBottom: '20px', borderBottom: '1px solid #f3f4f6', marginBottom: '20px' }
const heroImage: React.CSSProperties = { borderRadius: '6px', marginBottom: '14px', display: 'block', width: '100%', maxWidth: '560px' }
const thumbImage: React.CSSProperties = { borderRadius: '4px', display: 'block', objectFit: 'cover' as const }
const bigTitle: React.CSSProperties = { color: '#111827', fontSize: '18px', fontWeight: '700', textDecoration: 'none', lineHeight: '1.35', display: 'block', marginBottom: '10px' }
const itemTitle: React.CSSProperties = { color: '#111827', fontSize: '14px', fontWeight: '600', textDecoration: 'none', lineHeight: '1.4', display: 'block', marginBottom: '6px' }
const bigSummary: React.CSSProperties = { color: '#374151', fontSize: '15px', lineHeight: '1.65', margin: '0 0 10px' }
const itemSummary: React.CSSProperties = { color: '#4b5563', fontSize: '13px', lineHeight: '1.6', margin: '0 0 6px' }
const whyText: React.CSSProperties = { color: '#6b7280', fontSize: '12px', lineHeight: '1.5', margin: '0 0 6px', fontStyle: 'italic' }
const attribution: React.CSSProperties = { color: '#9ca3af', fontSize: '11px', margin: '0' }
const sourceLink: React.CSSProperties = { color: '#9ca3af', textDecoration: 'underline' }
const footer: React.CSSProperties = { paddingTop: '20px', paddingBottom: '28px', paddingLeft: '24px', paddingRight: '24px', textAlign: 'center' as const, backgroundColor: '#f9fafb' }
const footerLink: React.CSSProperties = { color: '#9ca3af', fontSize: '12px', textDecoration: 'underline' }
const footerText: React.CSSProperties = { color: '#9ca3af', fontSize: '11px', margin: '12px 0 4px', lineHeight: '1.5' }
const footerDisclaimer: React.CSSProperties = { color: '#d1d5db', fontSize: '10px', margin: '8px 0 0', lineHeight: '1.4' }
