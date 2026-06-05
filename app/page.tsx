'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Realistic sample issue data used in the landing page preview
const SAMPLE = [
  {
    label: 'THE BIG ONE',
    title: 'OpenAI rolls out o3 to all free users — and it\'s already changing the baseline',
    body: 'OpenAI\'s flagship reasoning model is now available on the free tier — the first time frontier-grade reasoning has shipped to everyone without a subscription.',
    why: 'The capability baseline for what your users can access just jumped. Products built on GPT-3.5 assumptions need rethinking.',
    source: 'TechCrunch',
    image: 'https://picsum.photos/seed/openai-o3/600/280',
    big: true,
  },
  {
    label: 'IN BRIEF',
    title: 'Google ships Gemini 2.5 Flash with 1M context window',
    body: 'The fastest model in the Gemini family now handles 1 million tokens in a single request — roughly 750,000 words.',
    source: 'Google DeepMind',
    image: 'https://picsum.photos/seed/google-gemini/300/160',
  },
  {
    label: 'NEW TOOLS',
    title: 'Cursor 1.0 ships with background agents',
    body: 'The AI code editor hits 1.0 with agents that run tasks silently while you keep coding — no context switching.',
    source: 'Cursor',
    image: 'https://picsum.photos/seed/cursor-ide/300/160',
  },
  {
    label: 'RESEARCH',
    title: 'Meta: LLMs plan better with "thinking tokens"',
    body: 'Inserting dedicated scratchpad tokens at inference time improves multi-step reasoning by 18% on standard benchmarks.',
    source: 'arXiv',
    image: 'https://picsum.photos/seed/meta-research/300/160',
  },
]

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

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
      const data = await res.json()
      if (!res.ok) { setErrorMsg(data.error || 'Something went wrong.'); setState('error') }
      else setState('success')
    } catch {
      setErrorMsg('Network error. Please try again.')
      setState('error')
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#111827] font-sans">

      {/* Nav */}
      <nav className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span className="font-bold text-[#111827] tracking-tight">Construx Daily</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/archive" className="text-gray-500 text-sm hover:text-gray-900 transition-colors">Archive</Link>
            {state !== 'success' && (
              <a href="#subscribe" className="bg-amber-500 hover:bg-amber-400 text-white text-sm font-semibold px-4 py-2 rounded-md transition-colors">
                Subscribe free
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-white border-b border-gray-100 px-6 py-20 sm:py-28 text-center">
        <div className="max-w-3xl mx-auto">

          <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 mb-8 tracking-wide uppercase">
            Free · Every morning at 8am
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6 text-[#111827]">
            AI news that fits<br />
            in your <span className="text-amber-500 relative">
              morning coffee.
              <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2 6C50 2 100 1 150 3C200 5 250 6 298 4" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" opacity="0.4"/>
              </svg>
            </span>
          </h1>

          <p className="text-gray-500 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl mx-auto">
            The most important AI stories, summarised in bite-sized chunks.
            No fluff, no filler — just signal.
          </p>

          {state === 'success' ? (
            <div id="subscribe" className="max-w-md mx-auto bg-amber-50 border border-amber-200 rounded-xl p-6">
              <p className="font-semibold text-amber-900 mb-1">Check your inbox.</p>
              <p className="text-amber-700 text-sm">We sent a confirmation to <strong>{email}</strong>. Click it to confirm your subscription.</p>
            </div>
          ) : (
            <form id="subscribe" onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-3 text-[#111827] placeholder-gray-400 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-sm bg-white"
                />
                <button
                  type="submit"
                  disabled={state === 'loading'}
                  className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors disabled:opacity-60 whitespace-nowrap shadow-sm"
                >
                  {state === 'loading' ? 'Subscribing…' : 'Subscribe free →'}
                </button>
              </div>
              {state === 'error' && <p className="text-red-500 text-sm mt-2 text-left">{errorMsg}</p>}
              <p className="text-gray-400 text-xs mt-3">Double opt-in. Unsubscribe in one click. No spam.</p>
            </form>
          )}
        </div>
      </section>

      {/* Social proof bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">Built for</span>
          {['Founders', 'Engineers', 'Product teams', 'Researchers', 'Investors'].map(label => (
            <span key={label} className="text-gray-500 text-sm font-medium">{label}</span>
          ))}
        </div>
      </div>

      {/* Sample issue — realistic email preview */}
      <section className="px-4 py-20 bg-[#f4f4f0]">
        <div className="max-w-[640px] mx-auto">

          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">This is what lands in your inbox</p>
            <h2 className="text-2xl font-bold text-[#111827]">Today&apos;s issue, every morning at 8am</h2>
          </div>

          {/* Email chrome wrapper */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-200">

            {/* Email client chrome bar */}
            <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white border border-gray-200 rounded px-3 py-1 text-xs text-gray-400 text-center">
                Construx Daily — Today&apos;s AI briefing | Friday 6 June
              </div>
            </div>

            {/* Email body */}
            <div className="px-7 py-6 font-sans">

              {/* Email header */}
              <div className="text-center pb-5 border-b border-gray-100 mb-5">
                <p className="text-base font-bold text-[#111827] mb-0.5">● Construx Daily</p>
                <p className="text-xs text-gray-400">Your bite-sized AI briefing · Friday, 6 June</p>
              </div>

              {/* THE BIG ONE with hero image */}
              <div className="mb-6 pb-6 border-b border-gray-100">
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-amber-600 mb-3">The Big One</p>
                <div className="relative w-full aspect-[600/280] rounded-lg overflow-hidden mb-4 bg-gray-100">
                  <Image
                    src={SAMPLE[0].image}
                    alt={SAMPLE[0].title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <a className="text-[#111827] font-bold text-[17px] leading-snug block mb-2 hover:text-amber-600 transition-colors cursor-pointer">
                  {SAMPLE[0].title}
                </a>
                <p className="text-gray-600 text-sm leading-relaxed mb-2">{SAMPLE[0].body}</p>
                <p className="text-gray-400 text-xs italic mb-1">
                  <span className="text-amber-600 font-semibold not-italic">Why it matters:</span>{' '}{SAMPLE[0].why}
                </p>
                <p className="text-gray-400 text-[11px]">via {SAMPLE[0].source}</p>
              </div>

              {/* Remaining sections with thumbnails */}
              <div className="space-y-5">
                {SAMPLE.slice(1).map((item, i) => (
                  <div key={i} className="pb-5 border-b border-gray-100 last:border-0 last:pb-0">
                    <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-amber-600 mb-2">{item.label}</p>
                    <div className="flex gap-3 items-start">
                      <div className="relative flex-shrink-0 w-[110px] h-[72px] rounded overflow-hidden bg-gray-100">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <a className="text-[#111827] font-semibold text-[13px] leading-snug block mb-1 hover:text-amber-600 transition-colors cursor-pointer">
                          {item.title}
                        </a>
                        <p className="text-gray-500 text-xs leading-relaxed mb-1">{item.body}</p>
                        <p className="text-gray-400 text-[11px]">via {item.source}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Email footer */}
              <div className="mt-6 pt-5 border-t border-gray-100 text-center bg-gray-50 -mx-7 px-7 -mb-6 pb-6">
                <p className="text-gray-400 text-xs">
                  <span className="underline cursor-pointer">Unsubscribe</span>{' · '}
                  <span className="underline cursor-pointer">View in browser</span>
                </p>
                <p className="text-gray-300 text-[10px] mt-1">Construx Group Ltd · London, UK</p>
              </div>
            </div>
          </div>

          {/* CTA below preview */}
          <div className="text-center mt-8">
            {state === 'success' ? (
              <p className="text-amber-600 font-semibold text-sm">You&apos;re subscribed. See you at 8am.</p>
            ) : (
              <a href="#subscribe" className="inline-block bg-amber-500 hover:bg-amber-400 text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors shadow-sm">
                Get this every morning →
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Why section */}
      <section className="bg-white border-t border-gray-100 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Why Construx Daily</p>
            <h2 className="text-2xl font-bold text-[#111827]">The signal, without the noise</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: '⚡',
                title: '90 seconds',
                desc: 'Every issue is designed to read in under two minutes. We cut everything that isn\'t essential.',
              },
              {
                icon: '🎯',
                title: 'Original summaries',
                desc: 'We write our own take on every story — never copy-paste. Every source is linked and credited.',
              },
              {
                icon: '📬',
                title: '8am, every morning',
                desc: 'Compiled automatically each day. You start with the full picture before your first meeting.',
              },
            ].map(item => (
              <div key={item.title} className="text-center p-6 rounded-xl border border-gray-100 bg-gray-50">
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="font-bold text-[#111827] mb-2">{item.title}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      {state !== 'success' && (
        <section className="px-6 py-16 bg-[#111827]">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-amber-500 text-xs font-semibold uppercase tracking-widest mb-3">Free forever</p>
            <h2 className="text-2xl font-bold text-white mb-2">Start tomorrow morning.</h2>
            <p className="text-gray-400 text-sm mb-8">Subscribe now and your first issue arrives at 8am tomorrow.</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 border border-white/20 bg-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 text-sm"
              />
              <button
                type="submit"
                disabled={state === 'loading'}
                className="bg-amber-500 hover:bg-amber-400 text-white font-semibold px-5 py-3 rounded-lg text-sm transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {state === 'loading' ? '…' : 'Subscribe →'}
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white px-6 py-6 text-center">
        <div className="flex items-center justify-center gap-6 mb-3">
          <Link href="/archive" className="text-gray-400 text-xs hover:text-gray-600 transition-colors">Archive</Link>
          <span className="text-gray-200">·</span>
          <span className="text-gray-400 text-xs">
            A <a href="https://construxgroup.com" className="hover:text-gray-600 transition-colors">Construx Group</a> venture
          </span>
        </div>
        <p className="text-gray-300 text-xs">Construx Group Ltd · London, UK</p>
      </footer>

    </div>
  )
}
