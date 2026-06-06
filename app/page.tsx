'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface IssueItem {
  id: string
  section: string
  position: number
  title: string
  summary: string
  whyMatters: string
  sourceUrl: string
  sourceName: string
  originalTitle: string
  imageUrl: string | null
}

interface Issue {
  id: string
  slug: string
  date: string
  subject: string
  previewText: string
  items: IssueItem[]
}

// ─── Design tokens (mirrors globals.css) ──────────────────────────────────────

const C = {
  cream:    '#FAF8F2',
  creamAlt: '#F0EBE0',
  ink:      '#0F0D0A',
  ink2:     '#5C5347',
  ink3:     '#9B9186',
  cobalt:   '#1A4ED8',
  cobaltDk: '#1440B5',
  signal:   '#F97316',
  border:   '#E4DDD1',
  card:     '#FFFFFF',
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TICKER = [
  'OpenAI o3 now free to all ChatGPT users',
  'Google ships Gemini 2.5 Flash with 1M context window',
  'Meta releases Llama 4 model weights publicly',
  'Cursor 1.0 launches with silent background agents',
  'Anthropic Claude 4 Opus sets new benchmark records',
  'Microsoft Copilot+ reaches 50M enterprise users',
  'DeepMind AlphaFold 3 goes fully open-source',
  'Perplexity AI launches enterprise search platform',
  'Hugging Face surpasses 1 million hosted models',
  'xAI Grok 3 debuts on X premium tier',
  'Mistral releases Le Chat for business with vision',
  'Scale AI raises $1B at $14B valuation',
]

const ROTATING_WORDS = ['founders', 'engineers', 'researchers', 'builders', 'product teams', 'investors']

const ISSUE_SECTIONS = [
  { label: 'The Big One', icon: '🎯', color: C.cobalt, desc: 'The most important AI story today, with full context and why it matters.' },
  { label: 'In Brief', icon: '⚡', color: '#0891B2', desc: 'Five fast takes on stories that matter but don\'t need 500 words.' },
  { label: 'New Tools', icon: '🔧', color: '#059669', desc: 'Every launch, release and update across the AI ecosystem.' },
  { label: 'Research', icon: '🔬', color: '#7C3AED', desc: 'Papers and findings worth knowing — translated out of academic.' },
  { label: 'Moves & Money', icon: '💰', color: C.signal, desc: 'Funding rounds, acquisitions and key appointments.' },
]

const SECTION_ORDER = ['BIG_ONE', 'IN_BRIEF', 'TOOLS', 'RESEARCH', 'MOVES']
const SECTION_LABELS: Record<string, string> = {
  BIG_ONE: 'The Big One', IN_BRIEF: 'In Brief', TOOLS: 'New Tools',
  RESEARCH: 'Research', MOVES: 'Moves & Money',
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useCountdown() {
  const [str, setStr] = useState({ h: '--', m: '--', s: '--' })
  useEffect(() => {
    function tick() {
      const now = new Date()
      const next = new Date()
      next.setHours(8, 0, 0, 0)
      if (now.getHours() >= 8) next.setDate(next.getDate() + 1)
      const total = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000))
      const h = Math.floor(total / 3600)
      const m = Math.floor((total % 3600) / 60)
      const s = total % 60
      setStr({ h: String(h).padStart(2, '0'), m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return str
}

function useRotating(words: string[], ms = 2800) {
  const [idx, setIdx] = useState(0)
  const [out, setOut] = useState(false)
  useEffect(() => {
    const id = setInterval(() => {
      setOut(true)
      setTimeout(() => { setIdx(i => (i + 1) % words.length); setOut(false) }, 320)
    }, ms)
    return () => clearInterval(id)
  }, [words, ms])
  return { word: words[idx], out }
}

function useCountUp(target: number, dur: number, active: boolean) {
  const [n, setN] = useState(0)
  useEffect(() => {
    if (!active) return
    let t0: number | null = null
    const step = (ts: number) => {
      if (!t0) t0 = ts
      const p = Math.min((ts - t0) / dur, 1)
      setN(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, dur, active])
  return n
}

function useRecentIssues() {
  const [issues, setIssues] = useState<Issue[]>([])
  useEffect(() => {
    fetch('/api/issues/recent').then(r => r.json()).then(setIssues).catch(() => {})
  }, [])
  return issues
}

// ─── Stat ─────────────────────────────────────────────────────────────────────

function Stat({ value, unit, label, active }: { value: number; unit: string; label: string; active: boolean }) {
  const n = useCountUp(value, 1400, active)
  return (
    <div style={{ textAlign: 'center', padding: '0 16px' }}>
      <div style={{ fontSize: '52px', fontWeight: 900, color: C.cobalt, lineHeight: 1, letterSpacing: '-3px', fontVariantNumeric: 'tabular-nums' }}>
        {n}<span style={{ fontSize: '26px', letterSpacing: '-1px' }}>{unit}</span>
      </div>
      <div style={{ color: C.ink3, fontSize: '12px', marginTop: '8px', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}

// ─── Live Mockup ──────────────────────────────────────────────────────────────

function LiveMockup({ issues }: { issues: Issue[] }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const body = bodyRef.current
    if (!body || issues.length === 0) return
    let cancelled = false
    let paused = false
    body.scrollTop = 0
    if (progressRef.current) progressRef.current.style.width = '0%'

    const id = setInterval(() => {
      if (cancelled || paused) return
      const maxScroll = body.scrollHeight - body.clientHeight
      if (maxScroll <= 2) return
      if (body.scrollTop >= maxScroll - 1) {
        paused = true
        if (progressRef.current) progressRef.current.style.width = '100%'
        setTimeout(() => {
          if (cancelled) return
          setFade(false)
          setTimeout(() => {
            if (cancelled) return
            setActiveIdx(i => (i + 1) % issues.length)
            setFade(true)
          }, 380)
        }, 1800)
      } else {
        body.scrollTop += 0.55
        if (progressRef.current) {
          progressRef.current.style.width = `${(body.scrollTop / maxScroll) * 100}%`
        }
      }
    }, 16)

    return () => { cancelled = true; clearInterval(id) }
  }, [activeIdx, issues.length])

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const wrap = wrapRef.current; const card = cardRef.current
    if (!wrap || !card) return
    const r = wrap.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    card.style.transform = `perspective(1100px) rotateX(${-y * 12}deg) rotateY(${x * 16}deg) scale(1.02)`
    card.style.transition = 'transform 0.06s ease-out'
  }

  function onLeave() {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(1100px) rotateX(5deg) rotateY(-7deg) scale(1)'
    card.style.transition = 'transform 0.9s cubic-bezier(0.34,1.2,0.64,1)'
  }

  const issue = issues[activeIdx]
  const sections: { key: string; label: string; items: IssueItem[] }[] = []
  if (issue) {
    for (const key of SECTION_ORDER) {
      const items = issue.items.filter(i => i.section === key).sort((a, b) => a.position - b.position)
      if (items.length > 0) sections.push({ key, label: SECTION_LABELS[key], items })
    }
  }

  const dateLabel = issue
    ? new Date(issue.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    : new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '40px' }}>

      {/* Cobalt glow pool */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '75%', height: '80px',
        background: 'radial-gradient(ellipse, rgba(26,78,216,0.20) 0%, transparent 70%)',
        filter: 'blur(28px)', zIndex: 0,
      }} />

      {/* Issue dots */}
      {issues.length > 1 && (
        <div style={{ display: 'flex', gap: '7px', marginBottom: '18px', zIndex: 2 }}>
          {issues.map((iss, i) => (
            <button key={iss.id}
              onClick={() => { setFade(false); setTimeout(() => { setActiveIdx(i); setFade(true) }, 380) }}
              style={{
                width: i === activeIdx ? '22px' : '7px', height: '7px', borderRadius: '4px',
                background: i === activeIdx ? C.cobalt : C.border,
                border: 'none', cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.34,1.2,0.64,1)', padding: 0,
              }}
            />
          ))}
        </div>
      )}

      <div className="mockup-float" style={{ position: 'relative', zIndex: 1 }}>
        <div ref={cardRef} style={{
          width: '380px', maxWidth: '100%', background: '#fff', borderRadius: '14px', overflow: 'hidden',
          boxShadow: '0 40px 80px -20px rgba(26,78,216,0.18), 0 0 0 1px rgba(26,78,216,0.10), 0 8px 32px -8px rgba(0,0,0,0.10)',
          transform: 'perspective(1100px) rotateX(5deg) rotateY(-7deg) scale(1)',
          transformOrigin: 'center center',
        }}>

          {/* Browser chrome */}
          <div style={{ background: '#1E1E2E', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['#ff5f57', '#ffbd2e', '#28c840'].map(c => (
                <span key={c} style={{ width: '11px', height: '11px', borderRadius: '50%', background: c, display: 'block' }} />
              ))}
            </div>
            <div style={{ flex: 1, background: '#2A2A3E', borderRadius: '5px', padding: '4px 10px', fontSize: '10px', color: '#6E6E8A', textAlign: 'center' }}>
              Construx Daily · {dateLabel}
            </div>
          </div>

          {/* Email sender */}
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${C.border}`, background: '#FAFAF8', display: 'flex', alignItems: 'center', gap: '9px' }}>
            <div style={{ width: '30px', height: '30px', background: C.cobalt, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>CD</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: C.ink }}>Construx Daily</div>
              <div style={{ fontSize: '9px', color: C.ink3 }}>daily@construxdaily.com</div>
            </div>
            <div style={{ fontSize: '9px', color: C.ink3, fontWeight: 600 }}>8:00 AM</div>
          </div>

          {/* Scrollable body */}
          <div style={{ height: '460px', overflow: 'hidden', position: 'relative' }}>
            <div ref={bodyRef} className="no-scrollbar"
              style={{ height: '100%', overflowY: 'scroll', scrollbarWidth: 'none', opacity: fade ? 1 : 0, transition: 'opacity 0.35s ease' }}>
              <div style={{ padding: '12px 14px 80px', fontFamily: "'Space Grotesk', Arial, sans-serif" }}>

                {/* Newsletter header */}
                <div style={{ textAlign: 'center', paddingBottom: '10px', marginBottom: '12px', borderBottom: `2px solid ${C.cobalt}` }}>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: C.ink, letterSpacing: '-0.3px' }}>● Construx Daily</div>
                  {issue && (
                    <div style={{ fontSize: '9px', color: C.ink3, marginTop: '3px', fontWeight: 500 }}>
                      {new Date(issue.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>

                {sections.length > 0 ? sections.map(({ key, label, items }) => (
                  <div key={key} style={{ marginBottom: '14px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.signal, marginBottom: '8px', paddingBottom: '5px', borderBottom: `1px solid ${C.border}` }}>
                      {label}
                    </div>
                    {items.map((item, idx) => (
                      <div key={item.id} style={{ marginBottom: idx < items.length - 1 ? '10px' : '0', paddingBottom: idx < items.length - 1 ? '10px' : '0', borderBottom: idx < items.length - 1 ? `1px solid #F7F5F0` : 'none' }}>
                        {key === 'BIG_ONE' ? (
                          <div>
                            {item.imageUrl && (
                              <div style={{ width: '100%', height: '120px', borderRadius: '7px', overflow: 'hidden', marginBottom: '8px', background: '#E8E4DA' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            )}
                            <div style={{ fontSize: '12px', fontWeight: 800, color: C.ink, lineHeight: 1.35, marginBottom: '5px' }}>{item.title}</div>
                            <div style={{ fontSize: '10px', color: C.ink2, lineHeight: 1.55, marginBottom: '5px' }}>{item.summary}</div>
                            {item.whyMatters && (
                              <div style={{ fontSize: '10px', color: C.ink3, lineHeight: 1.45 }}>
                                <span style={{ color: C.cobalt, fontWeight: 700 }}>Why it matters:</span>{' '}{item.whyMatters}
                              </div>
                            )}
                            <div style={{ fontSize: '9px', color: '#C4BCAF', marginTop: '4px' }}>via {item.sourceName}</div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {item.imageUrl && (
                              <div style={{ width: '68px', height: '50px', borderRadius: '5px', overflow: 'hidden', flexShrink: 0, background: '#E8E4DA' }}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              </div>
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: C.ink, lineHeight: 1.3, marginBottom: '3px' }}>{item.title}</div>
                              <div style={{ fontSize: '10px', color: C.ink2, lineHeight: 1.45, marginBottom: '3px' }}>
                                {item.summary.length > 85 ? item.summary.slice(0, 85) + '…' : item.summary}
                              </div>
                              <div style={{ fontSize: '9px', color: '#C4BCAF' }}>via {item.sourceName}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )) : (
                  <>
                    <div style={{ width: '100%', height: '120px', borderRadius: '7px', background: C.creamAlt, marginBottom: '10px' }} />
                    {[90, 65, 80].map((w, i) => (
                      <div key={i} style={{ width: `${w}%`, height: '10px', background: C.border, borderRadius: '4px', marginBottom: '6px' }} />
                    ))}
                  </>
                )}
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '56px', background: 'linear-gradient(to bottom, transparent, #fff)', pointerEvents: 'none' }} />
          </div>

          {/* Progress bar */}
          <div style={{ height: '3px', background: C.border }}>
            <div ref={progressRef} style={{ height: '100%', width: '0%', background: `linear-gradient(90deg, ${C.cobalt}, #6B8FFF)`, transition: 'width 0.08s linear' }} />
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Countdown Section ────────────────────────────────────────────────────────

function CountdownSection() {
  const { h, m, s } = useCountdown()
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const digitStyle = (delay: string): React.CSSProperties => ({
    fontFamily: 'monospace',
    fontSize: 'clamp(72px, 10vw, 130px)',
    fontWeight: 900,
    letterSpacing: '-4px',
    lineHeight: 1,
    color: C.ink,
    display: 'inline-block',
    minWidth: '2ch',
    textAlign: 'center',
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(32px)',
    transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}, transform 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}`,
  })

  const sepStyle: React.CSSProperties = {
    fontSize: 'clamp(56px, 8vw, 104px)',
    fontWeight: 900,
    color: C.signal,
    lineHeight: 1,
    padding: '0 4px',
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.5s 0.2s',
    userSelect: 'none',
  }

  return (
    <section ref={ref} style={{
      padding: 'clamp(80px,10vw,130px) 32px',
      borderTop: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      background: C.card,
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle cobalt wash behind the digits */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '600px', height: '250px',
        background: `radial-gradient(ellipse, rgba(26,78,216,0.05) 0%, transparent 70%)`,
        filter: 'blur(50px)', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative' }}>
        <p style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '0.28em',
          textTransform: 'uppercase', color: C.ink3, marginBottom: '40px',
          opacity: visible ? 1 : 0, transition: 'opacity 0.5s',
        }}>
          Until your next briefing
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={digitStyle('0.05s')}>{h}</span>
          <span style={sepStyle}>:</span>
          <span style={digitStyle('0.15s')}>{m}</span>
          <span style={sepStyle}>:</span>
          <span style={{ ...digitStyle('0.25s'), color: C.cobalt }}>{s}</span>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'center', marginTop: '16px',
          opacity: visible ? 1 : 0, transition: 'opacity 0.5s 0.4s',
          gap: '0',
        }}>
          {[
            { label: 'hours', w: 'calc(2ch + 8px + 3ch)' },
            { label: 'minutes', w: 'calc(2ch + 8px + 3ch)' },
            { label: 'seconds', w: '2ch' },
          ].map(({ label, w }) => (
            <div key={label} style={{ width: w, textAlign: 'center', fontSize: '11px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.ink3 }}>
              {label}
            </div>
          ))}
        </div>

        <p style={{
          fontSize: '15px', color: C.ink2, marginTop: '44px', lineHeight: 1.6,
          opacity: visible ? 1 : 0, transition: 'opacity 0.5s 0.5s',
        }}>
          Every morning at{' '}
          <span style={{ color: C.cobalt, fontWeight: 700 }}>8:00 AM</span>
          {' '}— in 90 seconds or less.
        </p>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [statsActive, setStatsActive] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const { word, out } = useRotating(ROTATING_WORDS)
  const issues = useRecentIssues()

  useEffect(() => {
    const el = statsRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStatsActive(true); obs.disconnect() }
    }, { threshold: 0.25 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      let data: { ok?: boolean; error?: string } = {}
      try { data = await res.json() } catch {}
      if (!res.ok) { setErrorMsg(data.error || 'Something went wrong.'); setState('error') }
      else setState('success')
    } catch {
      setErrorMsg('Could not reach the server. Check your connection.')
      setState('error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: C.cream, color: C.ink, fontFamily: "'Space Grotesk', Arial, sans-serif", overflowX: 'hidden', position: 'relative' }}>

      {/* ── Subtle ambient orbs ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {/* Cobalt — top right */}
        <div className="orb-1" style={{
          position: 'absolute', top: '-200px', right: '-150px',
          width: '700px', height: '700px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,78,216,0.07) 0%, transparent 68%)',
          filter: 'blur(60px)',
        }} />
        {/* Signal orange — bottom left */}
        <div className="orb-2" style={{
          position: 'absolute', bottom: '-300px', left: '-200px',
          width: '800px', height: '800px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(249,115,22,0.06) 0%, transparent 68%)',
          filter: 'blur(70px)',
        }} />
        {/* Warm dot grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(15,13,10,0.06) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Nav ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          backdropFilter: 'blur(20px) saturate(200%)',
          background: 'rgba(250,248,242,0.88)',
          borderBottom: `1px solid ${C.border}`,
          padding: '12px 40px',
        }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '10px', height: '10px', flexShrink: 0 }}>
                <div className="logo-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.cobalt }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: C.cobalt }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.4px', color: C.ink }}>Construx Daily</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <Link href="/archive" style={{ color: C.ink3, fontSize: '14px', textDecoration: 'none', fontWeight: 500 }}>Archive</Link>
              {state !== 'success' && (
                <a href="#subscribe" style={{
                  background: C.cobalt, color: '#fff', fontWeight: 800, fontSize: '13px',
                  padding: '9px 20px', borderRadius: '8px', textDecoration: 'none',
                  letterSpacing: '-0.2px', boxShadow: '0 4px 16px rgba(26,78,216,0.28)',
                }}>Subscribe free →</a>
              )}
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div className="hero-grid">

          {/* Left */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'rgba(26,78,216,0.06)',
              border: `1px solid rgba(26,78,216,0.18)`,
              borderRadius: '100px', padding: '7px 16px 7px 12px',
              marginBottom: '32px',
            }}>
              <span className="live-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: C.cobalt, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: C.cobalt, fontWeight: 700, letterSpacing: '0.03em' }}>
                Free · Every morning at 8am
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(38px, 4.8vw, 62px)', fontWeight: 900,
              lineHeight: 1.04, letterSpacing: '-2.5px', margin: '0 0 22px', color: C.ink,
            }}>
              The AI briefing
              <br />
              your morning{' '}
              <span className="text-shimmer">deserves.</span>
            </h1>

            <p style={{ fontSize: '18px', color: C.ink2, lineHeight: 1.6, margin: '0 0 10px' }}>
              Every breakthrough, launch and discovery — distilled to 90 seconds.
            </p>

            <p style={{ fontSize: '15px', color: C.ink3, margin: '0 0 40px', minHeight: '24px' }}>
              Read by{' '}
              <span style={{
                color: C.cobalt, fontWeight: 700, display: 'inline-block',
                transition: 'opacity 0.28s, transform 0.28s',
                opacity: out ? 0 : 1,
                transform: out ? 'translateY(-6px)' : 'translateY(0)',
              }}>
                {word}
              </span>
              {' '}worldwide.
            </p>

            {/* Subscribe form */}
            {state === 'success' ? (
              <div id="subscribe" style={{
                background: 'rgba(26,78,216,0.05)',
                border: `1px solid rgba(26,78,216,0.20)`,
                borderRadius: '14px', padding: '22px 26px',
              }}>
                <p style={{ fontWeight: 800, color: C.cobalt, margin: '0 0 6px', fontSize: '17px' }}>Check your inbox.</p>
                <p style={{ color: C.ink2, fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                  Confirmation sent to <strong style={{ color: C.ink }}>{email}</strong>. Click it to confirm your spot.
                </p>
              </div>
            ) : (
              <div id="subscribe">
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" required
                    style={{
                      flex: 1, minWidth: 0,
                      background: C.card, border: `1.5px solid ${C.border}`,
                      borderRadius: '11px', padding: '15px 18px',
                      color: C.ink, fontSize: '15px', outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={e => { e.target.style.borderColor = C.cobalt; e.target.style.boxShadow = '0 0 0 3px rgba(26,78,216,0.10)' }}
                    onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = 'none' }}
                  />
                  <button type="submit" disabled={state === 'loading'} style={{
                    background: C.cobalt, color: '#fff', fontWeight: 800, fontSize: '14px',
                    padding: '15px 24px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                    whiteSpace: 'nowrap', letterSpacing: '-0.2px',
                    boxShadow: '0 4px 20px rgba(26,78,216,0.35)',
                    transition: 'background 0.15s, box-shadow 0.15s',
                  }}
                    onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = C.cobaltDk; (e.target as HTMLButtonElement).style.boxShadow = '0 6px 28px rgba(26,78,216,0.48)' }}
                    onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = C.cobalt; (e.target as HTMLButtonElement).style.boxShadow = '0 4px 20px rgba(26,78,216,0.35)' }}
                  >
                    {state === 'loading' ? 'Subscribing…' : 'Subscribe free →'}
                  </button>
                </form>
                {state === 'error' && <p style={{ color: '#DC2626', fontSize: '13px', marginTop: '10px' }}>{errorMsg}</p>}
                <p style={{ color: C.ink3, fontSize: '12px', marginTop: '12px' }}>Free. Double opt-in. Unsubscribe anytime.</p>
              </div>
            )}
          </div>

          {/* Right: live mockup */}
          <LiveMockup issues={issues} />
        </div>

        {/* ── Breaking news ticker ── */}
        <div style={{
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          background: C.creamAlt,
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            <div style={{
              flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px',
              background: C.signal, color: '#fff',
              fontWeight: 900, fontSize: '11px', letterSpacing: '0.12em',
              padding: '13px 18px', textTransform: 'uppercase',
            }}>
              <span className="live-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff', display: 'block' }} />
              LIVE
            </div>
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="ticker-track" style={{ display: 'inline-flex', whiteSpace: 'nowrap', padding: '13px 0' }}>
                {[...TICKER, ...TICKER].map((item, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', paddingRight: '48px' }}>
                    <span style={{ color: C.ink2, fontSize: '13px', fontWeight: 500 }}>{item}</span>
                    <span style={{ marginLeft: '48px', color: C.border, fontSize: '16px' }}>◆</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div ref={statsRef} style={{ padding: '60px 32px', borderBottom: `1px solid ${C.border}`, background: C.card }}>
          <div className="stats-flex">
            <Stat value={11} unit="" label="Sources monitored" active={statsActive} />
            <div className="stat-divider" />
            <Stat value={90} unit="s" label="Avg. read time" active={statsActive} />
            <div className="stat-divider" />
            <Stat value={5} unit="" label="Curated sections" active={statsActive} />
            <div className="stat-divider" />
            <Stat value={8} unit="am" label="Daily send time" active={statsActive} />
          </div>
        </div>

        {/* ── Big Countdown ── */}
        <CountdownSection />

        {/* ── What's inside ── */}
        <section style={{ padding: '80px 48px', maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.ink3, marginBottom: '14px' }}>
              Every issue, every morning
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, letterSpacing: '-2px', color: C.ink, margin: 0, lineHeight: 1.1 }}>
              Five sections.{' '}<span className="text-shimmer">Zero filler.</span>
            </h2>
          </div>
          <div className="sections-grid">
            {ISSUE_SECTIONS.map(s => (
              <div key={s.label} className="feature-card">
                <div style={{ fontSize: '30px', marginBottom: '14px' }}>{s.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: s.color, marginBottom: '8px', letterSpacing: '-0.1px' }}>{s.label}</div>
                <div style={{ fontSize: '13px', color: C.ink2, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quote ── */}
        <section style={{
          padding: '72px 48px',
          borderTop: `1px solid ${C.border}`,
          borderBottom: `1px solid ${C.border}`,
          background: C.creamAlt,
          textAlign: 'center',
        }}>
          <blockquote style={{
            maxWidth: '720px', margin: '0 auto',
            fontSize: 'clamp(20px, 2.8vw, 30px)', fontWeight: 700,
            lineHeight: 1.4, letterSpacing: '-0.5px', color: C.ink,
          }}>
            &ldquo;The AI world moves so fast that missing one week means missing a decade.
            {' '}<span className="text-shimmer">Construx Daily keeps you in the room.</span>&rdquo;
          </blockquote>
        </section>

        {/* ── Bottom CTA — intentionally dark for contrast ── */}
        {state !== 'success' && (
          <section style={{ padding: '48px 32px 72px', background: C.creamAlt }}>
            <div style={{
              maxWidth: '1140px', margin: '0 auto',
              borderRadius: '28px', overflow: 'hidden', position: 'relative',
              background: 'linear-gradient(140deg, #0A1628 0%, #1A1F3C 50%, #0D1A14 100%)',
              border: `1px solid rgba(255,255,255,0.06)`,
            }}>
              <div style={{
                position: 'absolute', inset: 0,
                background: [
                  `radial-gradient(ellipse at 20% 50%, rgba(26,78,216,0.25) 0%, transparent 55%)`,
                  `radial-gradient(ellipse at 80% 50%, rgba(249,115,22,0.12) 0%, transparent 55%)`,
                ].join(', '),
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
                backgroundSize: '28px 28px',
              }} />

              <div style={{ position: 'relative', padding: '72px 32px', textAlign: 'center', maxWidth: '580px', margin: '0 auto' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: C.signal, marginBottom: '18px' }}>
                  Free forever · No credit card
                </div>
                <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-2.5px', color: '#FAFAF8', margin: '0 0 14px', lineHeight: 1.05 }}>
                  Start tomorrow<br />at 8am.
                </h2>
                <p style={{ color: 'rgba(250,248,242,0.55)', fontSize: '16px', margin: '0 0 40px', lineHeight: 1.6 }}>
                  Subscribe now. Your first issue arrives tomorrow morning.
                </p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '420px', margin: '0 auto' }}>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com" required
                    style={{
                      flex: 1, minWidth: 0,
                      background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)',
                      borderRadius: '11px', padding: '15px 18px',
                      color: '#FAFAF8', fontSize: '14px', outline: 'none',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(26,78,216,0.7)'; e.target.style.boxShadow = '0 0 0 3px rgba(26,78,216,0.15)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.12)'; e.target.style.boxShadow = 'none' }}
                  />
                  <button type="submit" disabled={state === 'loading'} style={{
                    background: C.cobalt, color: '#fff', fontWeight: 800, fontSize: '14px',
                    padding: '15px 22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                    whiteSpace: 'nowrap', boxShadow: '0 4px 28px rgba(26,78,216,0.50)',
                  }}>
                    {state === 'loading' ? '…' : 'Subscribe →'}
                  </button>
                </form>
                {state === 'error' && <p style={{ color: '#FCA5A5', fontSize: '13px', marginTop: '10px' }}>{errorMsg}</p>}
              </div>
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer style={{
          borderTop: `1px solid ${C.border}`,
          padding: '28px 40px',
          background: C.card,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: C.cobalt, display: 'inline-block' }} />
            <span style={{ fontWeight: 800, fontSize: '14px', color: C.ink2 }}>Construx Daily</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link href="/archive" style={{ color: C.ink3, fontSize: '12px', textDecoration: 'none' }}>Archive</Link>
            <span style={{ color: C.ink3, fontSize: '12px' }}>
              A <a href="https://construxgroup.com" style={{ color: C.ink2, textDecoration: 'none' }}>Construx Group</a> venture
            </span>
            <span style={{ color: C.ink3, fontSize: '12px' }}>Construx Group Ltd · London, UK</span>
          </div>
        </footer>

      </div>
    </div>
  )
}
