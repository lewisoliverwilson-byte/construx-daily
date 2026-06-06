/**
 * Seeds the database with 3 realistic past newsletter issues.
 * Run with: npx tsx scripts/seed-issues.ts
 */
import { config } from 'dotenv'
config({ path: '.env.local' })
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

// Image URLs use picsum.photos with topic-descriptive seeds
// so they return consistent, thematically-relevant photos
function img(seed: string, w = 600, h = 280) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

const ISSUES = [
  // ── June 3 ─────────────────────────────────────────────────────────────────
  {
    slug: '2026-06-03',
    date: new Date('2026-06-03T08:00:00.000Z'),
    subject: 'Anthropic drops Claude 4 Sonnet | Meta open-sources Llama 4',
    previewText: 'The fastest Claude yet, plus Meta bets big on open-source again.',
    status: 'SENT' as const,
    items: [
      {
        section: 'BIG_ONE' as const, position: 0,
        title: 'Anthropic releases Claude 4 Sonnet — 2× faster than its predecessor',
        summary: 'Anthropic shipped Claude 4 Sonnet, which the company says is twice as fast as Claude 3.5 Sonnet at a 25% lower API price. The model tops the LMSYS Chatbot Arena leaderboard for coding and instruction-following, and is live in Claude.ai and via API today.',
        whyMatters: 'Cheaper, faster frontier intelligence changes what you can ship at scale — real-time AI features that were too slow or expensive are now viable.',
        sourceUrl: 'https://www.anthropic.com/news/claude-4-sonnet', sourceName: 'Anthropic',
        originalTitle: 'Introducing Claude 4 Sonnet',
        imageUrl: img('anthropic-claude-sonnet-model'),
      },
      {
        section: 'IN_BRIEF' as const, position: 0,
        title: 'Meta open-sources Llama 4 Scout and Llama 4 Maverick',
        summary: 'Both Llama 4 models are now available on Hugging Face. Scout is optimised for single-GPU inference; Maverick targets multi-modal reasoning and outperforms GPT-4o on several vision benchmarks.',
        whyMatters: 'Open-source frontier models shrink the gap between well-funded labs and independent builders — and make self-hosting a serious option again.',
        sourceUrl: 'https://ai.meta.com/blog/llama-4-scout-maverick', sourceName: 'Meta AI',
        originalTitle: 'Llama 4: Scout and Maverick',
        imageUrl: img('meta-llama-open-source', 300, 160),
      },
      {
        section: 'IN_BRIEF' as const, position: 1,
        title: 'Google ships NotebookLM Plus with real-time web grounding',
        summary: 'NotebookLM Plus now pulls live web sources into its reasoning — not just uploaded documents. Users can ground responses in current news, research papers, and websites without manual uploads.',
        whyMatters: 'Grounded AI that stays current without manual curation removes one of the biggest friction points in enterprise AI adoption.',
        sourceUrl: 'https://notebooklm.google', sourceName: 'Google',
        originalTitle: 'NotebookLM Plus: real-time web grounding',
        imageUrl: img('google-notebooklm-web', 300, 160),
      },
      {
        section: 'TOOLS' as const, position: 0,
        title: 'Cursor 1.0 ships — AI code editor goes stable with background agents',
        summary: 'After a year in beta, Cursor hit 1.0 with its headline feature: background agents that run tests, refactors and documentation tasks silently while you keep coding. Subscribers get 10 concurrent agent runs.',
        whyMatters: 'Parallel AI execution is the next step change in developer productivity. Tools that work while you think are replacing tools that make you wait.',
        sourceUrl: 'https://cursor.com/blog/1.0', sourceName: 'Cursor',
        originalTitle: 'Cursor 1.0',
        imageUrl: img('cursor-code-editor-launch', 300, 160),
      },
      {
        section: 'RESEARCH' as const, position: 0,
        title: 'MIT: Sparse attention slashes LLM inference cost by 60% with no quality loss',
        summary: 'A new MIT CSAIL paper shows that selectively skipping attention computations on low-relevance tokens achieves a 60% compute reduction on standard benchmarks with negligible quality degradation.',
        whyMatters: 'Cheaper inference means AI features that were too expensive for consumer products become viable to ship.',
        sourceUrl: 'https://arxiv.org/abs/2406.12345', sourceName: 'arXiv / MIT CSAIL',
        originalTitle: 'Efficient Sparse Attention for LLMs',
        imageUrl: img('research-neural-network-science', 300, 160),
      },
      {
        section: 'MOVES' as const, position: 0,
        title: 'Scale AI closes $1B Series F at a $14B valuation',
        summary: 'Scale AI secured $1 billion in new funding led by Accel Partners, valuing the AI data-labelling and evaluation platform at $14 billion — up from $7.3B in 2023.',
        whyMatters: 'Data quality infrastructure becoming a $14B category signals how seriously the market values reliable training and evaluation pipelines.',
        sourceUrl: 'https://scale.com/blog/series-f', sourceName: 'Scale AI',
        originalTitle: 'Scale AI $1B Series F',
        imageUrl: img('startup-funding-investment', 300, 160),
      },
    ],
  },

  // ── June 4 ─────────────────────────────────────────────────────────────────
  {
    slug: '2026-06-04',
    date: new Date('2026-06-04T08:00:00.000Z'),
    subject: 'OpenAI o3 goes free | Mistral\'s new Le Chat | DeepMind surprise',
    previewText: 'Frontier reasoning for everyone, a slick new Mistral interface, and an AlphaFold update.',
    status: 'SENT' as const,
    items: [
      {
        section: 'BIG_ONE' as const, position: 0,
        title: 'OpenAI rolls o3 reasoning out to all free ChatGPT users worldwide',
        summary: 'OpenAI began a global rollout of its o3 reasoning model on the free tier — removing the Pro subscription requirement. The model, previously reserved for paying users, is now accessible to ChatGPT\'s entire user base of 400M+ weekly actives.',
        whyMatters: 'The capability floor for every user of every product you build just rose significantly. Anything assuming basic AI competence among users needs rethinking.',
        sourceUrl: 'https://openai.com/blog/o3-free-tier', sourceName: 'OpenAI',
        originalTitle: 'o3 now available to all ChatGPT users',
        imageUrl: img('openai-chatgpt-reasoning-model'),
      },
      {
        section: 'IN_BRIEF' as const, position: 0,
        title: 'Mistral launches Le Chat for Business with vision and real-time web search',
        summary: 'Mistral\'s consumer chat product is going enterprise — Le Chat for Business adds document vision, live web search, and team workspaces, competing directly with Microsoft Copilot and Google Gemini for Work.',
        whyMatters: 'A European AI company building a credible enterprise suite signals the market is moving from "AI experiments" to "AI infrastructure".',
        sourceUrl: 'https://mistral.ai/news/le-chat-business', sourceName: 'Mistral AI',
        originalTitle: 'Introducing Le Chat for Business',
        imageUrl: img('mistral-chat-business-product', 300, 160),
      },
      {
        section: 'IN_BRIEF' as const, position: 1,
        title: 'DeepMind AlphaFold 3 weights now open-sourced for academic research',
        summary: 'Google DeepMind released the full AlphaFold 3 model weights under an academic-use licence, enabling researchers to run the protein structure prediction model locally for the first time.',
        whyMatters: 'Local AlphaFold opens drug discovery research to underfunded labs that previously relied on the cloud API — accelerating the breadth of biomedical research.',
        sourceUrl: 'https://deepmind.google/blog/alphafold-3-open', sourceName: 'Google DeepMind',
        originalTitle: 'AlphaFold 3 open-sourced',
        imageUrl: img('deepmind-protein-structure-biology', 300, 160),
      },
      {
        section: 'TOOLS' as const, position: 0,
        title: 'Perplexity launches real-time AI search API — free for 100 queries/day',
        summary: 'Perplexity opened its Sonar API to developers with a free tier of 100 queries per day. The API returns cited, real-time answers grounded in live web results — not just cached training data.',
        whyMatters: 'Grounded, cited search as a commodity API is a new primitive for building products that need current information without hallucination risk.',
        sourceUrl: 'https://docs.perplexity.ai/blog/sonar-api-launch', sourceName: 'Perplexity',
        originalTitle: 'Perplexity Sonar API Launch',
        imageUrl: img('perplexity-search-api-developer', 300, 160),
      },
      {
        section: 'RESEARCH' as const, position: 0,
        title: 'Stanford: "Chain-of-thought" prompting works because of structured token routing',
        summary: 'A Stanford HAI paper argues CoT works not by mimicking human reasoning, but by routing computation through specialised token paths that activate different model circuits.',
        whyMatters: 'Understanding why CoT works helps you prompt more reliably and informs whether reasoning-specific architectures should replace it.',
        sourceUrl: 'https://arxiv.org/abs/2406.cot-routing', sourceName: 'arXiv / Stanford HAI',
        originalTitle: 'Why Chain-of-Thought Prompting Works',
        imageUrl: img('stanford-research-ai-paper', 300, 160),
      },
      {
        section: 'MOVES' as const, position: 0,
        title: 'Nvidia appoints Sarah Chen as first Chief AI Officer',
        summary: 'Nvidia created and filled a new C-suite role — Chief AI Officer — with Sarah Chen, previously VP of AI Product at Google. The move signals Nvidia\'s intention to expand beyond chip manufacturing into AI strategy consulting.',
        whyMatters: 'Nvidia moving upstack from hardware into advisory services could reshape how enterprises buy and deploy AI infrastructure.',
        sourceUrl: 'https://nvidianews.nvidia.com/news/chief-ai-officer', sourceName: 'Nvidia',
        originalTitle: 'Nvidia appoints first Chief AI Officer',
        imageUrl: img('nvidia-executive-appointment-tech', 300, 160),
      },
    ],
  },

  // ── June 5 ─────────────────────────────────────────────────────────────────
  {
    slug: '2026-06-05',
    date: new Date('2026-06-05T08:00:00.000Z'),
    subject: 'Hugging Face crosses 1M models | xAI Grok 3 drops | EU AI Act kicks in',
    previewText: 'A milestone for open-source, a new frontier model, and the first major AI regulation.',
    status: 'SENT' as const,
    items: [
      {
        section: 'BIG_ONE' as const, position: 0,
        title: 'Hugging Face crosses 1 million hosted models — open-source AI hits escape velocity',
        summary: 'Hugging Face announced it crossed 1 million models on its platform, with growth accelerating sharply after Meta\'s Llama 4 release. The platform now serves 50 billion model downloads per month, up from 10 billion a year ago.',
        whyMatters: 'A million open models means commoditisation is accelerating. The moat is shifting from "who has the best model" to "who builds the best product around them".',
        sourceUrl: 'https://huggingface.co/blog/1-million-models', sourceName: 'Hugging Face',
        originalTitle: 'Hugging Face: 1 Million Models',
        imageUrl: img('huggingface-open-source-ai-milestone'),
      },
      {
        section: 'IN_BRIEF' as const, position: 0,
        title: 'xAI drops Grok 3 — claims top scores on math and science benchmarks',
        summary: 'Elon Musk\'s xAI released Grok 3 to X Premium subscribers, claiming it tops GPT-4o and Claude 3.5 Sonnet on MATH-500 and GPQA Diamond benchmarks. Third-party evals are underway.',
        whyMatters: 'A credible challenger in math and science reasoning expands what AI tools developers can reliably use for technical domains.',
        sourceUrl: 'https://x.ai/blog/grok-3', sourceName: 'xAI',
        originalTitle: 'Grok 3: Built for Science and Math',
        imageUrl: img('xai-grok-model-release', 300, 160),
      },
      {
        section: 'IN_BRIEF' as const, position: 1,
        title: 'EU AI Act transparency requirements take effect for high-risk systems',
        summary: 'The EU AI Act\'s transparency and explainability requirements came into force for "high-risk" AI systems including those used in hiring, lending and critical infrastructure, affecting any company serving EU users.',
        whyMatters: 'If your product makes consequential decisions about people in the EU, you now legally need explainability built in — not bolted on later.',
        sourceUrl: 'https://digital-strategy.ec.europa.eu/ai-act-update', sourceName: 'European Commission',
        originalTitle: 'EU AI Act: High-Risk Requirements Enter Force',
        imageUrl: img('eu-regulation-policy-governance', 300, 160),
      },
      {
        section: 'TOOLS' as const, position: 0,
        title: 'Replit launches Replit Agent 2.0 — full-stack apps from a text prompt',
        summary: 'Replit Agent 2.0 can build, deploy and configure a full-stack web app from a single natural language description — including database setup, auth, and a live production URL.',
        whyMatters: 'The time from "idea" to "deployed app" dropping to minutes fundamentally changes the experimentation speed for product teams.',
        sourceUrl: 'https://replit.com/blog/agent-2', sourceName: 'Replit',
        originalTitle: 'Replit Agent 2.0',
        imageUrl: img('replit-coding-platform-agent', 300, 160),
      },
      {
        section: 'RESEARCH' as const, position: 0,
        title: 'Google Brain: Mixture-of-Experts models can now route at token level, not layer',
        summary: 'A Google Brain paper shows token-level MoE routing — where each token picks its expert at every layer independently — improves performance 18% over standard MoE on language and vision tasks.',
        whyMatters: 'Finer-grained routing means smarter specialisation — future models will be better at switching modes within a single response.',
        sourceUrl: 'https://arxiv.org/abs/2406.token-moe', sourceName: 'arXiv / Google Brain',
        originalTitle: 'Token-Level Mixture of Experts',
        imageUrl: img('google-brain-ml-research-paper', 300, 160),
      },
      {
        section: 'MOVES' as const, position: 0,
        title: 'Cohere raises $500M Series D, valuation hits $5.5B',
        summary: 'Enterprise-focused AI firm Cohere closed a $500M Series D led by PSP Investments and Cisco Investments, valuing the company at $5.5 billion. The round brings total funding to over $900M.',
        whyMatters: 'Enterprise AI is still attracting large cheques — and Cohere\'s B2B focus shows investors see a durable market for private, customisable LLMs beyond consumer products.',
        sourceUrl: 'https://cohere.com/blog/series-d', sourceName: 'Cohere',
        originalTitle: 'Cohere $500M Series D',
        imageUrl: img('cohere-enterprise-ai-funding', 300, 160),
      },
    ],
  },
]

async function main() {
  console.log('Seeding past newsletter issues...')

  for (const issue of ISSUES) {
    const existing = await db.issue.findUnique({ where: { slug: issue.slug } })
    if (existing) {
      console.log(`  Skipping ${issue.slug} — already exists`)
      continue
    }

    const { items, ...issueData } = issue
    await db.issue.create({
      data: {
        ...issueData,
        items: { create: items },
      },
    })
    console.log(`  Created issue ${issue.slug} with ${items.length} items`)
  }

  console.log('Done.')
  await db.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
