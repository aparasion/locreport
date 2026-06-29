'use client'

import { useState } from 'react'

type Fact = {
  id: string
  content: string
  category: string
  source_name: string | null
  source_url: string | null
  article_id: string | null
  created_at: string
  articles: { slug: string } | null
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

function FactRow({ fact, onDeleted, onSaved, onLinked }: {
  fact: Fact
  onDeleted: (id: string) => void
  onSaved: (id: string, content: string) => void
  onLinked: (id: string, article_id: string | null, slug: string | null) => void
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(fact.content)
  const [linkingArticle, setLinkingArticle] = useState(false)
  const [slugInput, setSlugInput] = useState(fact.articles?.slug ?? '')
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function save() {
    if (!draft.trim() || draft === fact.content) { setEditing(false); return }
    setBusy(true)
    setError('')
    const res = await fetch(`/api/facts/${fact.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: draft.trim() }),
    })
    setBusy(false)
    if (!res.ok) { setError('Save failed'); return }
    onSaved(fact.id, draft.trim())
    setEditing(false)
  }

  async function saveLink() {
    setBusy(true)
    setError('')
    const slug = slugInput.trim() || null

    if (slug) {
      // Resolve slug → article_id
      const res = await fetch(`/api/articles?slug=${encodeURIComponent(slug)}`)
      if (!res.ok) { setBusy(false); setError('Article not found'); return }
      const data = await res.json()
      const article = Array.isArray(data) ? data[0] : data?.article ?? data
      if (!article?.id) { setBusy(false); setError('Article not found'); return }

      const patchRes = await fetch(`/api/facts/${fact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: article.id }),
      })
      setBusy(false)
      if (!patchRes.ok) { setError('Link failed'); return }
      onLinked(fact.id, article.id, slug)
    } else {
      // Clear the link
      const patchRes = await fetch(`/api/facts/${fact.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_id: null }),
      })
      setBusy(false)
      if (!patchRes.ok) { setError('Unlink failed'); return }
      onLinked(fact.id, null, null)
    }
    setLinkingArticle(false)
  }

  async function deleteFact() {
    setBusy(true)
    setError('')
    const res = await fetch(`/api/facts/${fact.id}`, { method: 'DELETE' })
    setBusy(false)
    if (!res.ok) { setError('Delete failed'); setConfirming(false); return }
    onDeleted(fact.id)
  }

  const articleSlug = fact.articles?.slug ?? null

  return (
    <div style={{ borderBottom: '1px solid var(--border)', padding: 'var(--space-4) 0' }}>
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--accent)',
              background: 'var(--bg)',
              color: 'var(--text)',
              fontSize: '0.9rem',
              lineHeight: 1.5,
              resize: 'vertical',
              fontFamily: 'var(--font-body)',
            }}
          />
          {error && <p style={{ fontSize: '0.75rem', color: '#dc2626' }}>{error}</p>}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button
              onClick={save}
              disabled={busy}
              style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', opacity: busy ? 0.6 : 1 }}
            >
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setEditing(false); setDraft(fact.content); setError('') }}
              disabled={busy}
              style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.55, margin: 0 }}>{fact.content}</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '4px' }}>
              {timeAgo(fact.created_at)}
              {fact.source_name && ` · ${fact.source_name}`}
              {fact.source_url && (
                <> · <a href={fact.source_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>source</a></>
              )}
              {articleSlug && (
                <> · <a href={`/articles/${articleSlug}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>article</a></>
              )}
            </p>

            {/* Article link editor */}
            {linkingArticle && (
              <div style={{ marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={slugInput}
                  onChange={e => setSlugInput(e.target.value)}
                  placeholder="article slug (leave blank to unlink)"
                  style={{
                    flex: 1,
                    minWidth: 200,
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--accent)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-mono)',
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') saveLink(); if (e.key === 'Escape') { setLinkingArticle(false); setSlugInput(articleSlug ?? '') } }}
                  autoFocus
                />
                <button
                  onClick={saveLink}
                  disabled={busy}
                  style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', opacity: busy ? 0.6 : 1 }}
                >
                  {busy ? '…' : slugInput.trim() ? 'Link' : 'Unlink'}
                </button>
                <button
                  onClick={() => { setLinkingArticle(false); setSlugInput(articleSlug ?? ''); setError('') }}
                  disabled={busy}
                  style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                {error && <span style={{ fontSize: '0.72rem', color: '#dc2626' }}>{error}</span>}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
            {confirming ? (
              <>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Delete?</span>
                <button
                  onClick={deleteFact}
                  disabled={busy}
                  style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 'var(--radius-sm)', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer', opacity: busy ? 0.6 : 1 }}
                >
                  {busy ? '…' : 'Yes'}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={busy}
                  style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  No
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setEditing(true)}
                  style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', color: 'var(--muted)', border: '1px solid var(--border)', cursor: 'pointer' }}
                >
                  Edit
                </button>
                <button
                  onClick={() => { setLinkingArticle(v => !v); setSlugInput(articleSlug ?? ''); setError('') }}
                  style={{
                    fontSize: '0.75rem', padding: '3px 10px', borderRadius: 'var(--radius-sm)',
                    background: articleSlug ? 'var(--accent-soft, #eef0ff)' : 'var(--bg-secondary)',
                    color: articleSlug ? 'var(--accent)' : 'var(--muted)',
                    border: '1px solid var(--border)', cursor: 'pointer'
                  }}
                >
                  {articleSlug ? 'Linked' : 'Link'}
                </button>
                <button
                  onClick={() => setConfirming(true)}
                  style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 'var(--radius-sm)', background: '#dc2626', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  Delete
                </button>
              </>
            )}
            {!linkingArticle && error && <span style={{ fontSize: '0.72rem', color: '#dc2626' }}>{error}</span>}
          </div>
        </div>
      )}
    </div>
  )
}

export function FactFlowAdmin({ initialFacts }: { initialFacts: Fact[] }) {
  const [facts, setFacts] = useState(initialFacts)

  function handleDeleted(id: string) {
    setFacts(f => f.filter(x => x.id !== id))
  }

  function handleSaved(id: string, content: string) {
    setFacts(f => f.map(x => x.id === id ? { ...x, content } : x))
  }

  function handleLinked(id: string, article_id: string | null, slug: string | null) {
    setFacts(f => f.map(x => x.id === id ? { ...x, article_id, articles: slug ? { slug } : null } : x))
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>Fact Flow</h1>
        <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{facts.length} facts</span>
      </div>

      {facts.length === 0 ? (
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No facts yet.</p>
      ) : (
        <div style={{ maxWidth: 760 }}>
          {facts.map(fact => (
            <FactRow
              key={fact.id}
              fact={fact}
              onDeleted={handleDeleted}
              onSaved={handleSaved}
              onLinked={handleLinked}
            />
          ))}
        </div>
      )}
    </div>
  )
}
