'use client'
import { useEffect, useState, useCallback } from 'react'
import { RssSource } from '@/lib/types'
import { SourceForm } from '@/components/SourceForm'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function SourcesPage() {
  const [sources, setSources] = useState<RssSource[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editUrl, setEditUrl] = useState('')

  const load = useCallback(() => {
    fetch('/api/sources').then(r => r.json()).then(setSources)
  }, [])

  useEffect(() => { load() }, [load])

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/sources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    })
    load()
  }

  async function remove(id: string) {
    if (!confirm('Delete this source?')) return
    await fetch(`/api/sources/${id}`, { method: 'DELETE' })
    load()
  }

  function startEdit(source: RssSource) {
    setEditingId(source.id)
    setEditName(source.name)
    setEditUrl(source.url)
  }

  async function saveEdit(id: string) {
    await fetch(`/api/sources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, url: editUrl }),
    })
    setEditingId(null)
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-6">RSS Sources</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-medium text-[#5A6278] uppercase tracking-wide mb-4">Add source</h2>
          <SourceForm onAdded={load} />
        </div>
        <div>
          <h2 className="text-sm font-medium text-[#5A6278] uppercase tracking-wide mb-4">
            Active sources ({sources.filter(s => s.active).length})
          </h2>
          <div className="flex flex-col gap-3">
            {sources.map(source => (
              <Card key={source.id} className="p-4">
                {editingId === source.id ? (
                  <div className="flex flex-col gap-2">
                    <Input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Name" />
                    <Input value={editUrl} onChange={e => setEditUrl(e.target.value)} placeholder="URL" />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(source.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm text-[#111827]">{source.name}</p>
                      <p className="text-xs text-[#5A6278] truncate max-w-48">{source.url}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(source)}>Edit</Button>
                      <Button size="sm" variant="secondary" onClick={() => toggle(source.id, source.active)}>
                        {source.active ? 'Disable' : 'Enable'}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => remove(source.id)}>Delete</Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
