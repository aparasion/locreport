'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function SourceForm({ onAdded }: { onAdded: () => void }) {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/sources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, name }),
    })
    if (res.ok) {
      setUrl('')
      setName('')
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
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading}>{loading ? 'Adding…' : 'Add source'}</Button>
    </form>
  )
}
