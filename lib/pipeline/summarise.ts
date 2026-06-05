import Anthropic from '@anthropic-ai/sdk'
import { ScoredItem } from './rank'
import { Section } from '@prisma/client'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface SummarisedItem extends ScoredItem {
  summary: string
  whyMatters: string
}

async function summariseItem(item: ScoredItem): Promise<SummarisedItem> {
  const context = item.excerpt
    ? `Title: ${item.title}\n\nSource: ${item.sourceName}\n\nExcerpt: ${item.excerpt}`
    : `Title: ${item.title}\n\nSource: ${item.sourceName}`

  const isBigOne = item.section === Section.BIG_ONE

  const prompt = `You are writing for Construx Daily, a bite-sized AI newsletter. The USP is brevity — every word must earn its place.

${context}

Write:
1. SUMMARY: ${isBigOne ? '3 sentences max' : '1-2 sentences max'}. Original, accurate, never copying from the source. No jargon. No fluff.
2. WHY_MATTERS: Exactly one sentence. What this means for people building with AI.

Format your response as:
SUMMARY: [your summary]
WHY_MATTERS: [your one sentence]`

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const summaryMatch = text.match(/SUMMARY:\s*(.+?)(?=WHY_MATTERS:|$)/s)
  const whyMatch = text.match(/WHY_MATTERS:\s*(.+)/s)

  return {
    ...item,
    summary: summaryMatch?.[1]?.trim() ?? item.title,
    whyMatters: whyMatch?.[1]?.trim() ?? '',
  }
}

export async function summariseAll(items: ScoredItem[]): Promise<SummarisedItem[]> {
  // Batch with small delay to respect rate limits
  const results: SummarisedItem[] = []
  for (const item of items) {
    const result = await summariseItem(item)
    results.push(result)
  }
  return results
}

export async function generateSubjectLine(items: SummarisedItem[], dateStr: string): Promise<{ subject: string; previewText: string }> {
  const headlines = items.slice(0, 3).map(i => i.title).join(' | ')

  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: `Write an email subject line and preview text for today's Construx Daily AI newsletter (${dateStr}).

Top stories today: ${headlines}

Rules:
- Subject: under 55 characters, punchy, no clickbait, no emoji
- Preview: under 90 characters, complements the subject, teases what's inside

Format:
SUBJECT: [subject]
PREVIEW: [preview text]`,
    }],
  })

  const text = msg.content[0].type === 'text' ? msg.content[0].text : ''
  const subjectMatch = text.match(/SUBJECT:\s*(.+)/i)
  const previewMatch = text.match(/PREVIEW:\s*(.+)/i)

  return {
    subject: subjectMatch?.[1]?.trim() ?? `Construx Daily — ${dateStr}`,
    previewText: previewMatch?.[1]?.trim() ?? 'Your bite-sized AI briefing.',
  }
}
