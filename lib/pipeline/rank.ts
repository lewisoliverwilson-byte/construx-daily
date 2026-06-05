import { ClusteredItem } from './dedupe'
import { Section } from '@prisma/client'

const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'machine learning', 'llm', 'large language model',
  'gpt', 'claude', 'gemini', 'llama', 'mistral', 'neural', 'deep learning', 'chatbot',
  'generative', 'openai', 'anthropic', 'deepmind', 'hugging face', 'transformer',
  'diffusion', 'image generation', 'text generation', 'model', 'agent', 'automation',
  'robotics', 'computer vision', 'natural language', 'nlp', 'foundation model',
  'multimodal', 'inference', 'training', 'fine-tuning',
]

const TOOLS_SIGNALS = ['launch', 'release', 'announce', 'introduce', 'new tool', 'new model', 'available', 'debut', 'unveil', 'ship']
const RESEARCH_SIGNALS = ['paper', 'research', 'study', 'arxiv', 'benchmark', 'finding', 'discover', 'scientist', 'university', 'laboratory', 'propose']
const MOVES_SIGNALS = ['raise', 'fund', 'invest', 'acquire', 'merge', 'hire', 'appoint', 'ceo', 'valuation', 'ipo', 'round', 'billion', 'million']

export interface ScoredItem extends ClusteredItem {
  score: number
  section: Section
}

function aiRelevanceScore(item: ClusteredItem): number {
  const text = `${item.title} ${item.excerpt}`.toLowerCase()
  const matches = AI_KEYWORDS.filter(kw => text.includes(kw)).length
  return Math.min(matches / 3, 1)
}

function recencyScore(publishedAt: Date): number {
  const ageHours = (Date.now() - publishedAt.getTime()) / (1000 * 60 * 60)
  if (ageHours < 6) return 1.0
  if (ageHours < 12) return 0.85
  if (ageHours < 24) return 0.65
  return 0.4
}

function detectSection(item: ClusteredItem): Section {
  const text = `${item.title} ${item.excerpt}`.toLowerCase()
  if (RESEARCH_SIGNALS.some(s => text.includes(s))) return Section.RESEARCH
  if (TOOLS_SIGNALS.some(s => text.includes(s))) return Section.TOOLS
  if (MOVES_SIGNALS.some(s => text.includes(s))) return Section.MOVES
  return Section.IN_BRIEF
}

export function rankAndSection(items: ClusteredItem[]): ScoredItem[] {
  const scored = items.map(item => {
    const aiScore = aiRelevanceScore(item)
    const recency = recencyScore(item.publishedAt)
    const excerptBonus = item.excerpt.length > 100 ? 0.1 : 0
    const multiSourceBonus = item.alternativeSources.length * 0.05
    const score = aiScore * 0.5 + recency * 0.4 + excerptBonus + multiSourceBonus

    return {
      ...item,
      score,
      section: detectSection(item),
    }
  })

  return scored.sort((a, b) => b.score - a.score)
}

const SECTION_CAPS: Record<Section, number> = {
  [Section.BIG_ONE]: 1,
  [Section.IN_BRIEF]: 5,
  [Section.TOOLS]: 3,
  [Section.RESEARCH]: 2,
  [Section.MOVES]: 2,
}

export function selectForIssue(scored: ScoredItem[]): ScoredItem[] {
  const counts: Record<string, number> = {}
  const selected: ScoredItem[] = []

  // Top item becomes BIG_ONE regardless of detected section
  const [top, ...rest] = scored
  if (top) {
    selected.push({ ...top, section: Section.BIG_ONE })
    counts[Section.BIG_ONE] = 1
  }

  for (const item of rest) {
    const cap = SECTION_CAPS[item.section]
    const current = counts[item.section] ?? 0
    if (current < cap) {
      selected.push(item)
      counts[item.section] = current + 1
    }
    if (selected.length >= 13) break
  }

  return selected
}
