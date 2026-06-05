'use client'

import { useState } from 'react'
import Link from 'next/link'

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
      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.')
        setState('error')
      } else {
        setState('success')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setState('error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <span className="text-amber-500 font-bold text-lg tracking-tight">Construx Daily</span>
          <Link href="/archive" className="text-gray-400 text-sm hover:text-white transition-colors">
            Archive
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-xl mx-auto">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-amber-500/20 bg-amber-500/5 rounded-full px-3 py-1 text-xs text-amber-400 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
            Daily at 8am · Free forever
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-5 leading-tight">
            AI news in<br />
            <span className="text-amber-500">bite-sized chunks.</span>
          </h1>

          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            Every morning at 8am, we scan the internet for the most important AI stories
            and send you a tight, accurate briefing. No fluff. Just signal.
          </p>

          {state === 'success' ? (
            <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-6">
              <p className="text-amber-400 font-semibold text-lg mb-1">Check your inbox.</p>
              <p className="text-gray-400 text-sm">We&apos;ve sent a confirmation link to <strong className="text-white">{email}</strong>. Click it to confirm your subscription.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-white/8 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={state === 'loading'}
                className="bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] font-bold px-6 py-3 rounded-lg text-sm transition-colors disabled:opacity-60 whitespace-nowrap"
              >
                {state === 'loading' ? 'Subscribing…' : 'Subscribe free'}
              </button>
            </form>
          )}

          {state === 'error' && (
            <p className="text-red-400 text-sm mt-3">{errorMsg}</p>
          )}

          <p className="text-gray-600 text-xs mt-4">
            Double opt-in. Unsubscribe in one click. No spam, ever.
          </p>
        </div>

        {/* What you get */}
        <div className="mt-24 max-w-3xl mx-auto w-full">
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-8">What&apos;s in each issue</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
            {[
              { label: 'The Big One', desc: 'The day\'s most important story, summarised fast.' },
              { label: 'In Brief', desc: 'Quick-hit bullets of other notable news.' },
              { label: 'New Tools', desc: 'Fresh AI products and releases worth a look.' },
              { label: 'Research', desc: 'A notable paper or finding, in plain English.' },
              { label: 'Moves & Money', desc: 'Funding, acquisitions, and business shifts.' },
              { label: 'Always linked', desc: 'Every story links to the original source.' },
            ].map(item => (
              <div key={item.label} className="border border-white/5 rounded-lg p-4 bg-white/[0.02]">
                <p className="text-amber-500 text-xs font-semibold uppercase tracking-wide mb-1">{item.label}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-6 text-center">
        <p className="text-gray-600 text-xs">
          A{' '}
          <a href="https://construxgroup.com" className="text-gray-500 hover:text-gray-400 transition-colors">
            Construx Group
          </a>{' '}
          venture
        </p>
      </footer>
    </div>
  )
}
