'use client'

import { useEffect, useState } from 'react'

interface Source {
  id: string
  name: string
  type: 'RSS' | 'NEWS_API' | 'SCRAPER'
  url: string
  enabled: boolean
  weight: number
  lastFetched: string | null
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'RSS', url: '', weight: '1.0' })

  async function load() {
    const res = await fetch('/api/admin/sources')
    setSources(await res.json())
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleEnabled(source: Source) {
    await fetch('/api/admin/sources', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: source.id, enabled: !source.enabled }),
    })
    setSources(prev => prev.map(s => s.id === source.id ? { ...s, enabled: !s.enabled } : s))
  }

  async function deleteSource(id: string) {
    if (!confirm('Delete this source?')) return
    await fetch('/api/admin/sources', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setSources(prev => prev.filter(s => s.id !== id))
  }

  async function addSource(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)
    const res = await fetch('/api/admin/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, weight: parseFloat(form.weight) }),
    })
    const created = await res.json()
    setSources(prev => [...prev, created])
    setForm({ name: '', type: 'RSS', url: '', weight: '1.0' })
    setAdding(false)
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-xl font-bold mb-6">Sources</h1>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="space-y-2 mb-10">
          {sources.map(source => (
            <div key={source.id} className={`border rounded-xl px-4 py-3 flex items-center gap-4 transition-all ${
              source.enabled ? 'border-white/10' : 'border-white/5 opacity-50'
            }`}>
              <button
                onClick={() => toggleEnabled(source)}
                className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                  source.enabled ? 'bg-amber-500 border-amber-500 text-[#0a0a0a]' : 'border-white/20'
                }`}
              >
                {source.enabled && <span className="text-xs font-bold">✓</span>}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium">{source.name}</p>
                <p className="text-gray-500 text-xs truncate">{source.url}</p>
                {source.lastFetched && (
                  <p className="text-gray-600 text-xs">Last fetched: {new Date(source.lastFetched).toLocaleString()}</p>
                )}
              </div>
              <span className="text-gray-600 text-xs shrink-0">{source.type}</span>
              <span className="text-gray-600 text-xs shrink-0">w:{source.weight}</span>
              <button onClick={() => deleteSource(source.id)} className="text-red-500/50 hover:text-red-400 text-xs transition-colors">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add source form */}
      <div className="border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-semibold mb-4">Add source</h2>
        <form onSubmit={addSource} className="space-y-3">
          <input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Name (e.g. TechCrunch AI)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/40" />
          <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/40">
            <option value="RSS">RSS</option>
            <option value="NEWS_API">NEWS_API</option>
          </select>
          <input required value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
            placeholder="Feed URL"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/40" />
          <input type="number" step="0.1" min="0.1" max="3" value={form.weight}
            onChange={e => setForm(p => ({ ...p, weight: e.target.value }))}
            placeholder="Weight (1.0)"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/40" />
          <button type="submit" disabled={adding}
            className="bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] font-bold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-60">
            {adding ? 'Adding…' : 'Add source'}
          </button>
        </form>
      </div>
    </main>
  )
}
