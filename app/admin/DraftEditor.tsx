'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Issue, IssueItem, Section } from '@prisma/client'

type IssueWithItems = Issue & { items: IssueItem[] }

const SECTION_LABELS: Record<Section, string> = {
  BIG_ONE: 'The Big One',
  IN_BRIEF: 'In Brief',
  TOOLS: 'New Tools & Launches',
  RESEARCH: 'Research Worth Knowing',
  MOVES: 'Moves & Money',
}

const SECTION_ORDER: Section[] = ['BIG_ONE', 'IN_BRIEF', 'TOOLS', 'RESEARCH', 'MOVES']

export default function DraftEditor({ issue }: { issue: IssueWithItems }) {
  const router = useRouter()
  const [items, setItems] = useState(issue.items)
  const [held, setHeld] = useState(issue.held)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const isSent = issue.status === 'SENT'

  async function toggleHold() {
    setSaving(true)
    await fetch('/api/admin/hold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueId: issue.id, hold: !held }),
    })
    setHeld(!held)
    setSaving(false)
  }

  async function sendNow() {
    if (!confirm(`Send to all confirmed subscribers now?`)) return
    setSending(true)
    const res = await fetch('/api/admin/hold', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ issueId: issue.id }),
    })
    const data = await res.json()
    alert(`Sent to ${data.sent} subscribers.`)
    setSending(false)
    router.refresh()
  }

  async function deleteItem(itemId: string) {
    if (!confirm('Remove this item from the issue?')) return
    await fetch('/api/admin/draft', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId }),
    })
    setItems(prev => prev.filter(i => i.id !== itemId))
  }

  async function saveItem(itemId: string, summary: string, whyMatters: string) {
    await fetch('/api/admin/draft', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, summary, whyMatters }),
    })
    setItems(prev => prev.map(i => i.id === itemId ? { ...i, summary, whyMatters } : i))
    setEditingId(null)
  }

  const grouped = SECTION_ORDER.reduce((acc, s) => {
    const sectionItems = items.filter(i => i.section === s)
    if (sectionItems.length > 0) acc[s] = sectionItems
    return acc
  }, {} as Partial<Record<Section, IssueItem[]>>)

  return (
    <div>
      {/* Issue meta */}
      <div className="border border-white/5 rounded-xl p-5 mb-6 space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide">Subject</p>
        <p className="text-white font-semibold">{issue.subject}</p>
        <p className="text-gray-500 text-sm">{issue.previewText}</p>
      </div>

      {/* Controls */}
      {!isSent && (
        <div className="flex gap-3 mb-8">
          <button
            onClick={toggleHold}
            disabled={saving}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              held
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20'
                : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            {held ? '⏸ Held — click to release' : '⏸ Hold issue'}
          </button>
          <button
            onClick={sendNow}
            disabled={sending}
            className="bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] font-bold px-5 py-2 rounded-lg text-sm transition-colors disabled:opacity-60"
          >
            {sending ? 'Sending…' : '→ Send now'}
          </button>
        </div>
      )}

      {isSent && (
        <div className="border border-green-500/20 bg-green-500/5 rounded-lg px-4 py-3 mb-6 text-green-400 text-sm">
          Sent to {issue.sendCount} subscribers.
        </div>
      )}

      {/* Items */}
      {SECTION_ORDER.map(section => {
        const sectionItems = grouped[section]
        if (!sectionItems) return null
        return (
          <section key={section} className="mb-8">
            <h2 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-4">
              {SECTION_LABELS[section]}
            </h2>
            <div className="space-y-4">
              {sectionItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  editing={editingId === item.id}
                  onEdit={() => setEditingId(item.id)}
                  onSave={saveItem}
                  onCancel={() => setEditingId(null)}
                  onDelete={deleteItem}
                  readonly={isSent}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function ItemCard({
  item, editing, onEdit, onSave, onCancel, onDelete, readonly,
}: {
  item: IssueItem
  editing: boolean
  onEdit: () => void
  onSave: (id: string, summary: string, why: string) => Promise<void>
  onCancel: () => void
  onDelete: (id: string) => Promise<void>
  readonly: boolean
}) {
  const [summary, setSummary] = useState(item.summary)
  const [whyMatters, setWhyMatters] = useState(item.whyMatters)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await onSave(item.id, summary, whyMatters)
    setSaving(false)
  }

  return (
    <div className="border border-white/5 rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="text-white font-semibold text-sm hover:text-amber-400 transition-colors line-clamp-2">
            {item.title}
          </a>
          <p className="text-gray-500 text-xs mt-0.5">{item.sourceName}</p>
        </div>
        {!readonly && (
          <div className="flex gap-2 shrink-0">
            {!editing && (
              <>
                <button onClick={onEdit} className="text-gray-500 hover:text-white text-xs transition-colors">Edit</button>
                <button onClick={() => onDelete(item.id)} className="text-red-500/60 hover:text-red-400 text-xs transition-colors">Remove</button>
              </>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <div className="mt-3 space-y-2">
          <textarea
            value={summary}
            onChange={e => setSummary(e.target.value)}
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/40 resize-none"
            placeholder="Summary"
          />
          <input
            value={whyMatters}
            onChange={e => setWhyMatters(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/40"
            placeholder="Why it matters"
          />
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving}
              className="bg-amber-500 hover:bg-amber-400 text-[#0a0a0a] font-bold px-4 py-1.5 rounded-lg text-xs transition-colors">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={onCancel} className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-1">
          <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>
          {whyMatters && (
            <p className="text-gray-500 text-xs italic">
              <span className="text-amber-500 not-italic font-semibold">Why it matters:</span>{' '}{whyMatters}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
