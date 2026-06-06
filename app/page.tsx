'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

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
  { label: 'The Big One', icon: '🎯', color: '#F59E0B', desc: 'The most important AI story today, with full context and why it matters.' },
  { label: 'In Brief', icon: '⚡', color: '#60a5fa', desc: 'Five fast takes on stories that matter but don\'t need 500 words.' },
  { label: 'New Tools', icon: '🔧', color: '#34d399', desc: 'Every launch, release and update across the AI ecosystem.' },
  { label: 'Research', icon: '🔬', color: '#a78bfa', desc: 'Papers and findings worth knowing — translated out of academic.' },
  { label: 'Moves & Money', icon: '💰', color: '#fb923c', desc: 'Funding rounds, acquisitions and key appointments.' },
]

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useCountdown() {
  const [str, setStr] = useState('--:--:--')
  useEffect(() => {
    function tick() {
      const now = new Date()
      const next = new Date()
      next.setHours(8, 0, 0, 0)
      if (now.getHours() >= 8) next.setDate(next.getDate() + 1)
      const s = Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000))
      const h = Math.floor(s / 3600)
      const m = Math.floor((s % 3600) / 60)
      const sec = s % 60
      setStr(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`)
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

// ─── Stat ─────────────────────────────────────────────────────────────────────

function Stat({ value, unit, label, active }: { value: number; unit: string; label: string; active: boolean }) {
  const n = useCountUp(value, 1400, active)
  return (
    <div style={{ textAlign: 'center', padding: '0 16px' }}>
      <div style={{ fontSize: '52px', fontWeight: 900, color: '#F59E0B', lineHeight: 1, letterSpacing: '-3px', fontVariantNumeric: 'tabular-nums' }}>
        {n}<span style={{ fontSize: '26px', letterSpacing: '-1px' }}>{unit}</span>
      </div>
      <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '8px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}

// ─── 3D Mockup ────────────────────────────────────────────────────────────────

function Mockup() {
  const cardRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const wrap = wrapRef.current
    const card = cardRef.current
    if (!wrap || !card) return
    const r = wrap.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    card.style.transform = `perspective(1100px) rotateX(${-y * 14}deg) rotateY(${x * 18}deg) scale(1.02)`
    card.style.transition = 'transform 0.06s ease-out'
  }

  function onLeave() {
    const card = cardRef.current
    if (!card) return
    card.style.transform = 'perspective(1100px) rotateX(6deg) rotateY(-8deg) scale(1)'
    card.style.transition = 'transform 0.9s cubic-bezier(0.34,1.2,0.64,1)'
  }

  return (
    <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ position: 'relative', display: 'flex', justifyContent: 'center', paddingBottom: '40px' }}>

      {/* Glow pool under card */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '75%', height: '80px',
        background: 'radial-gradient(ellipse, rgba(245,158,11,0.40) 0%, transparent 70%)',
        filter: 'blur(24px)',
        zIndex: 0,
      }} />

      {/* Floating wrapper */}
      <div className="mockup-float" style={{ position: 'relative', zIndex: 1 }}>
        <div ref={cardRef} style={{
          width: '380px', maxWidth: '100%',
          background: '#ffffff',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 60px 100px -30px rgba(0,0,0,0.85), 0 0 0 1px rgba(245,158,11,0.25), 0 0 60px -20px rgba(245,158,11,0.15)',
          transform: 'perspective(1100px) rotateX(6deg) rotateY(-8deg) scale(1)',
          transformOrigin: 'center center',
        }}>

          {/* Browser chrome */}
          <div style={{ background: '#1c1c1e', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['#ff5f57','#ffbd2e','#28c840'].map(c => (
                <span key={c} style={{ width: '11px', height: '11px', borderRadius: '50%', background: c, display: 'block' }} />
              ))}
            </div>
            <div style={{ flex: 1, background: '#2c2c2e', borderRadius: '5px', padding: '4px 10px', fontSize: '10px', color: '#636366', textAlign: 'center' }}>
              Construx Daily — AI Briefing · {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>

          {/* Email sender row */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6', background: '#fafaf9', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: '#F59E0B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#000', flexShrink: 0 }}>CD</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#111' }}>Construx Daily</div>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>daily@construxdaily.com</div>
            </div>
            <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600 }}>8:00 AM</div>
          </div>

          {/* Email body */}
          <div style={{ padding: '14px 16px', fontFamily: "'Space Grotesk', Arial, sans-serif", position: 'relative', maxHeight: '500px', overflow: 'hidden' }}>

            {/* Header */}
            <div style={{ textAlign: 'center', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#111', letterSpacing: '-0.2px' }}>● Construx Daily</div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>Your bite-sized AI briefing</div>
            </div>

            {/* BIG ONE */}
            <div style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#d97706', marginBottom: '8px' }}>The Big One</div>
              {/* Hero image */}
              <div style={{ width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px', background: '#e5e7eb' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://picsum.photos/seed/openai-o3/400/200" alt="Story" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#111', lineHeight: 1.35, marginBottom: '5px' }}>
                OpenAI rolls out o3 to all free users
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.5, marginBottom: '5px' }}>
                Frontier reasoning now ships to everyone — no subscription required.
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af', fontStyle: 'italic' }}>
                <span style={{ color: '#d97706', fontStyle: 'normal', fontWeight: 700 }}>Why it matters:</span>{' '}
                Your users now have frontier AI. Rebuild your assumptions.
              </div>
            </div>

            {/* IN BRIEF */}
            <div style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#d97706', marginBottom: '8px' }}>In Brief</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '72px', height: '50px', borderRadius: '5px', overflow: 'hidden', flexShrink: 0, background: '#e5e7eb' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://picsum.photos/seed/google-gemini/200/140" alt="Gemini" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#111', lineHeight: 1.3 }}>Google ships Gemini 2.5 Flash with 1M context</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px' }}>via Google DeepMind</div>
                </div>
              </div>
            </div>

            {/* NEW TOOLS */}
            <div>
              <div style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#d97706', marginBottom: '8px' }}>New Tools</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ width: '72px', height: '50px', borderRadius: '5px', overflow: 'hidden', flexShrink: 0, background: '#e5e7eb' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="https://picsum.photos/seed/cursor-ide/200/140" alt="Cursor" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#111', lineHeight: 1.3 }}>Cursor 1.0 ships with background agents</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px' }}>via Cursor</div>
                </div>
              </div>
            </div>

            {/* Fade bottom */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '70px', background: 'linear-gradient(to bottom, transparent, #fff)', pointerEvents: 'none' }} />
          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle'|'loading'|'success'|'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [statsActive, setStatsActive] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)
  const countdown = useCountdown()
  const { word, out } = useRotating(ROTATING_WORDS)

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      let data: { ok?: boolean; error?: string } = {}
      try { data = await res.json() } catch {}
      if (!res.ok) { setErrorMsg(data.error || 'Something went wrong. Please try again.'); setState('error') }
      else setState('success')
    } catch {
      setErrorMsg('Could not reach the server. Please check your connection.')
      setState('error')
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#06060f', color: '#f9fafb', fontFamily: "'Space Grotesk', Arial, sans-serif", overflowX: 'hidden', position: 'relative' }}>

      {/* ── Animated background ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {/* Amber orb — top left */}
        <div className="orb-1" style={{
          position: 'absolute', top: '-280px', left: '-180px',
          width: '800px', height: '800px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.13) 0%, transparent 68%)',
          filter: 'blur(50px)',
        }} />
        {/* Indigo orb — bottom right */}
        <div className="orb-2" style={{
          position: 'absolute', bottom: '-350px', right: '-250px',
          width: '1000px', height: '1000px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 68%)',
          filter: 'blur(70px)',
        }} />
        {/* Subtle grid */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.018) 1px,transparent 1px)',
          backgroundSize: '72px 72px',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Nav ── */}
        <nav style={{
          position: 'sticky', top: 0, zIndex: 100,
          backdropFilter: 'blur(24px) saturate(180%)',
          background: 'rgba(6,6,15,0.82)',
          borderBottom: '1px solid rgba(255,255,255,0.055)',
          padding: '13px 40px',
        }}>
          <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', width: '10px', height: '10px', flexShrink: 0 }}>
                <div className="logo-ping" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#F59E0B' }} />
                <div className="logo-dot" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#F59E0B' }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.4px' }}>Construx Daily</span>
            </div>
            {/* Nav links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
              <Link href="/archive" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none', transition: 'color 0.15s' }}>Archive</Link>
              {state !== 'success' && (
                <a href="#subscribe" style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                  color: '#000', fontWeight: 800, fontSize: '13px',
                  padding: '9px 20px', borderRadius: '8px', textDecoration: 'none',
                  letterSpacing: '-0.2px',
                  boxShadow: '0 4px 16px rgba(245,158,11,0.28)',
                }}>Subscribe free →</a>
              )}
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <div className="hero-grid">

          {/* Left: copy */}
          <div>
            {/* Countdown badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              background: 'rgba(245,158,11,0.07)',
              border: '1px solid rgba(245,158,11,0.22)',
              borderRadius: '100px', padding: '7px 16px 7px 12px',
              marginBottom: '32px',
            }}>
              <span className="live-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 700, letterSpacing: '0.03em' }}>
                NEXT ISSUE IN{' '}
                <span style={{ fontFamily: 'monospace', fontSize: '13px', letterSpacing: '0.06em', color: '#fff' }}>{countdown}</span>
              </span>
            </div>

            {/* Headline */}
            <h1 style={{
              fontSize: 'clamp(38px, 4.8vw, 62px)',
              fontWeight: 900,
              lineHeight: 1.04,
              letterSpacing: '-2.5px',
              margin: '0 0 22px',
              color: '#f9fafb',
            }}>
              The AI briefing
              <br />
              your morning{' '}
              <span className="text-shimmer">deserves.</span>
            </h1>

            {/* Sub */}
            <p style={{ fontSize: '18px', color: '#9ca3af', lineHeight: 1.6, margin: '0 0 10px' }}>
              Every breakthrough, launch and discovery — distilled to 90 seconds.
            </p>

            {/* Rotating audience */}
            <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 40px', minHeight: '24px' }}>
              Read by{' '}
              <span style={{
                color: '#fbbf24', fontWeight: 700,
                display: 'inline-block',
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
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.25)',
                borderRadius: '14px', padding: '22px 26px',
              }}>
                <p style={{ fontWeight: 800, color: '#fbbf24', margin: '0 0 6px', fontSize: '17px' }}>Check your inbox.</p>
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                  Confirmation sent to <strong style={{ color: '#f9fafb' }}>{email}</strong>. Click it to confirm your spot.
                </p>
              </div>
            ) : (
              <div id="subscribe">
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    style={{
                      flex: 1, minWidth: 0,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: '11px',
                      padding: '15px 18px',
                      color: '#f9fafb', fontSize: '15px', outline: 'none',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'rgba(245,158,11,0.55)'
                      e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.10)'
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = 'rgba(255,255,255,0.10)'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={state === 'loading'}
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                      color: '#000', fontWeight: 800, fontSize: '14px',
                      padding: '15px 24px', borderRadius: '11px',
                      border: 'none', cursor: 'pointer',
                      whiteSpace: 'nowrap', letterSpacing: '-0.2px',
                      boxShadow: '0 4px 24px rgba(245,158,11,0.38)',
                      transition: 'opacity 0.15s, box-shadow 0.15s',
                    }}
                    onMouseEnter={e => { (e.target as HTMLButtonElement).style.boxShadow = '0 6px 32px rgba(245,158,11,0.55)' }}
                    onMouseLeave={e => { (e.target as HTMLButtonElement).style.boxShadow = '0 4px 24px rgba(245,158,11,0.38)' }}
                  >
                    {state === 'loading' ? 'Subscribing…' : 'Subscribe free →'}
                  </button>
                </form>
                {state === 'error' && <p style={{ color: '#f87171', fontSize: '13px', marginTop: '10px', margin: '10px 0 0' }}>{errorMsg}</p>}
                <p style={{ color: '#374151', fontSize: '12px', marginTop: '12px', margin: '12px 0 0' }}>Free. Double opt-in. Unsubscribe anytime.</p>
              </div>
            )}
          </div>

          {/* Right: 3D mockup */}
          <Mockup />
        </div>

        {/* ── Breaking news ticker ── */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.045)',
          borderBottom: '1px solid rgba(255,255,255,0.045)',
          background: 'rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', alignItems: 'stretch' }}>
            {/* LIVE badge */}
            <div style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '8px',
              background: '#F59E0B', color: '#000',
              fontWeight: 900, fontSize: '11px', letterSpacing: '0.12em',
              padding: '13px 18px',
              textTransform: 'uppercase',
            }}>
              <span className="live-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#000', display: 'block' }} />
              LIVE
            </div>
            {/* Scrolling headlines */}
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div className="ticker-track" style={{ display: 'inline-flex', whiteSpace: 'nowrap', padding: '13px 0' }}>
                {[...TICKER, ...TICKER].map((item, i) => (
                  <span key={i} style={{ display: 'inline-flex', alignItems: 'center', paddingRight: '48px' }}>
                    <span style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 500 }}>{item}</span>
                    <span style={{ marginLeft: '48px', color: '#2d2d3a', fontSize: '16px' }}>◆</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div ref={statsRef} style={{ padding: '60px 32px', borderBottom: '1px solid rgba(255,255,255,0.045)' }}>
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

        {/* ── What's inside ── */}
        <section style={{ padding: '80px 48px', maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#4b5563', marginBottom: '14px' }}>
              Every issue, every morning
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, letterSpacing: '-2px', color: '#f9fafb', margin: 0, lineHeight: 1.1 }}>
              Five sections.{' '}<span className="text-shimmer">Zero filler.</span>
            </h2>
          </div>
          <div className="sections-grid">
            {ISSUE_SECTIONS.map(s => (
              <div key={s.label} className="feature-card">
                <div style={{ fontSize: '30px', marginBottom: '14px' }}>{s.icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: s.color, marginBottom: '8px', letterSpacing: '-0.1px' }}>{s.label}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Quote / Manifesto ── */}
        <section style={{
          padding: '72px 48px',
          borderTop: '1px solid rgba(255,255,255,0.045)',
          borderBottom: '1px solid rgba(255,255,255,0.045)',
          background: 'rgba(0,0,0,0.2)',
          textAlign: 'center',
        }}>
          <blockquote style={{
            maxWidth: '720px', margin: '0 auto',
            fontSize: 'clamp(20px, 2.8vw, 30px)',
            fontWeight: 700, lineHeight: 1.4,
            letterSpacing: '-0.5px',
            color: '#f9fafb',
          }}>
            &ldquo;The AI world moves so fast that missing one week means missing a decade.
            {' '}<span className="text-shimmer">Construx Daily keeps you in the room.</span>&rdquo;
          </blockquote>
        </section>

        {/* ── Bottom CTA ── */}
        {state !== 'success' && (
          <section style={{ padding: '48px 32px 72px' }}>
            <div style={{
              maxWidth: '1140px', margin: '0 auto',
              borderRadius: '28px', overflow: 'hidden',
              position: 'relative',
              background: 'linear-gradient(140deg, #100500 0%, #0d0020 45%, #001408 100%)',
              border: '1px solid rgba(245,158,11,0.12)',
            }}>
              {/* Mesh overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                background: [
                  'radial-gradient(ellipse at 25% 50%, rgba(245,158,11,0.13) 0%, transparent 55%)',
                  'radial-gradient(ellipse at 75% 50%, rgba(99,102,241,0.07) 0%, transparent 55%)',
                ].join(', '),
              }} />
              {/* Grid overlay */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)',
                backgroundSize: '60px 60px',
              }} />

              <div style={{ position: 'relative', padding: '72px 32px', textAlign: 'center', maxWidth: '580px', margin: '0 auto' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#F59E0B', marginBottom: '18px' }}>
                  Free forever · No credit card
                </div>
                <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 900, letterSpacing: '-2.5px', color: '#f9fafb', margin: '0 0 14px', lineHeight: 1.05 }}>
                  Start tomorrow<br />at 8am.
                </h2>
                <p style={{ color: '#6b7280', fontSize: '16px', margin: '0 0 40px', lineHeight: 1.6 }}>
                  Subscribe now. Your first issue arrives tomorrow morning.
                </p>
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', maxWidth: '420px', margin: '0 auto' }}>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    style={{
                      flex: 1, minWidth: 0,
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: '11px',
                      padding: '15px 18px',
                      color: '#f9fafb', fontSize: '14px', outline: 'none',
                    }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(245,158,11,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(245,158,11,0.10)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.10)'; e.target.style.boxShadow = 'none' }}
                  />
                  <button
                    type="submit"
                    disabled={state === 'loading'}
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
                      color: '#000', fontWeight: 800, fontSize: '14px',
                      padding: '15px 22px', borderRadius: '11px',
                      border: 'none', cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 4px 28px rgba(245,158,11,0.45)',
                    }}
                  >
                    {state === 'loading' ? '…' : 'Subscribe →'}
                  </button>
                </form>
                {state === 'error' && <p style={{ color: '#f87171', fontSize: '13px', marginTop: '10px' }}>{errorMsg}</p>}
              </div>
            </div>
          </section>
        )}

        {/* ── Footer ── */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.045)',
          padding: '28px 40px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#F59E0B', display: 'inline-block' }} />
            <span style={{ fontWeight: 800, fontSize: '14px', color: '#4b5563' }}>Construx Daily</span>
          </div>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <Link href="/archive" style={{ color: '#4b5563', fontSize: '12px', textDecoration: 'none' }}>Archive</Link>
            <span style={{ color: '#1f2937', fontSize: '12px' }}>
              A <a href="https://construxgroup.com" style={{ color: '#4b5563', textDecoration: 'none' }}>Construx Group</a> venture
            </span>
            <span style={{ color: '#1f2937', fontSize: '12px' }}>Construx Group Ltd · London, UK</span>
          </div>
        </footer>

      </div>
    </div>
  )
}
