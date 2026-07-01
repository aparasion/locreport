'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function SearchRefine({ initialQ }: { initialQ: string }) {
  const [value, setValue] = useState(initialQ)
  const router = useRouter()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const q = value.trim()
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem', marginBottom: 'var(--space-6)' }}>
      <div style={{
        flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)', padding: '0 var(--space-3)',
        height: 42, boxSizing: 'border-box',
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--muted)' }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          autoFocus
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Refine your search…"
          style={{
            flex: 1, minWidth: 0, width: '100%', border: 'none', background: 'none', outline: 'none',
            fontSize: '0.95rem', color: 'var(--text)', fontFamily: 'inherit',
          }}
        />
        {value && (
          <button type="button" onClick={() => setValue('')} aria-label="Clear"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, display: 'flex', alignItems: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>
      <button type="submit" style={{
        flexShrink: 0, padding: '0 var(--space-4)', height: 42, background: 'var(--accent)', color: '#fff',
        border: 'none', borderRadius: 'var(--radius-sm)', fontWeight: 600,
        fontSize: '0.875rem', cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
        Search
      </button>
    </form>
  )
}
