'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SourceForm({ onAdded }: { onAdded: () => void }) {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [keywordsRaw, setKeywordsRaw] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const keywords = keywordsRaw
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(Boolean)
    const res = await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, name, keywords }),
    })
    if (res.ok) {
      setUrl('')
      setName('')
      setKeywordsRaw('')
      onAdded()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to add source')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div>
        <Label htmlFor="src-name">Feed name</Label>
        <Input id="src-name" value={name} onChange={e => setName(e.target.value)} placeholder="SlatorPod" required />
      </div>
      <div>
        <Label htmlFor="src-url">RSS URL</Label>
        <Input id="src-url" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://slator.com/feed" required />
      </div>
      <div>
        <Label htmlFor="src-keywords">Keywords filter <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(optional)</span></Label>
        <Input
          id="src-keywords"
          value={keywordsRaw}
          onChange={e => setKeywordsRaw(e.target.value)}
          placeholder="translate, translation, localization, linguistics"
        />
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
          Comma-separated. If set, only RSS items whose title or description contains at least one keyword will be ingested.
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Adding…' : 'Add source'}</Button>
    </form>
  )
}
