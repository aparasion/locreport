'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import type { Event } from '@/lib/data/events'

const EMPTY_FORM = {
  name: '',
  organizer: '',
  start_date: '',
  end_date: '',
  location: '',
  format: 'in-person' as Event['format'],
  category: 'conference' as Event['category'],
  url: '',
  description: '',
  tags: '',
}

function datesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return aStart <= bEnd && aEnd >= bStart
}

function findDuplicate(form: typeof EMPTY_FORM, events: Event[]): Event | null {
  const name = form.name.trim().toLowerCase()
  if (!name || !form.start_date) return null
  const end = form.end_date || form.start_date
  return events.find(ev => {
    if (ev.name.trim().toLowerCase() !== name) return false
    const evEnd = ev.end_date || ev.start_date
    return datesOverlap(form.start_date, end, ev.start_date, evEnd)
  }) ?? null
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isDbBacked, setIsDbBacked] = useState(false)
  const [duplicate, setDuplicate] = useState<Event | null>(null)

  const [migrating, setMigrating] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/events')
    const data: Event[] = await res.json()
    setEvents(data)
    // DB-backed if any event has a UUID id
    if (data.some(e => /^[0-9a-f-]{36}$/.test(e.id))) setIsDbBacked(true)
  }, [])

  useEffect(() => { load() }, [load])

  async function migrateToDb() {
    setMigrating(true)
    setMessage('')
    const res = await fetch('/api/admin/seed-events', { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      setMessage(data.inserted > 0 ? `Migrated ${data.inserted} events to database.` : data.message)
      setIsDbBacked(true)
      load()
    } else {
      setMessage(data.error ?? 'Migration failed.')
    }
    setMigrating(false)
  }

  function set(field: keyof typeof EMPTY_FORM, value: string) {
    const updated = { ...form, [field]: value }
    setForm(updated)
    setDuplicate(findDuplicate(updated, events))
  }

  function startEdit(ev: Event) {
    setForm({
      name: ev.name,
      organizer: ev.organizer ?? '',
      start_date: ev.start_date,
      end_date: ev.end_date ?? '',
      location: ev.location ?? '',
      format: ev.format,
      category: ev.category,
      url: ev.url ?? '',
      description: ev.description ?? '',
      tags: (ev.tags ?? []).join(', '),
    })
    setEditingId(ev.id)
    setDuplicate(null)
    setMessage('')
  }

  function cancelEdit() {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setDuplicate(null)
    setMessage('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.start_date) return

    const dupe = findDuplicate(form, editingId ? events.filter(ev => ev.id !== editingId) : events)
    if (dupe) {
      setDuplicate(dupe)
      return
    }

    setSaving(true)
    setMessage('')

    const payload = {
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      end_date: form.end_date || form.start_date,
    }

    const res = editingId
      ? await fetch(`/api/events/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      : await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })

    if (res.ok) {
      setForm(EMPTY_FORM)
      setEditingId(null)
      setDuplicate(null)
      setMessage(editingId ? 'Event updated.' : 'Event added.')
      setIsDbBacked(true)
      load()
    } else {
      const err = await res.json()
      setMessage(err.error ?? (editingId ? 'Failed to update event.' : 'Failed to add event.'))
    }
    setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm('Delete this event?')) return
    await fetch(`/api/events/${id}`, { method: 'DELETE' })
    if (editingId === id) cancelEdit()
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Events</h1>

      {!isDbBacked && events.length > 0 && (
        <div className="mb-6 rounded-lg px-4 py-3 text-sm flex items-center justify-between gap-4 flex-wrap" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--muted)' }}>
          <span>Showing hardcoded static events — migrate to database to enable editing and deletion.</span>
          <Button size="sm" onClick={migrateToDb} disabled={migrating}>
            {migrating ? 'Migrating…' : 'Migrate to database'}
          </Button>
        </div>
      )}
      {message && (
        <p className="mb-4 text-sm" style={{ color: message.startsWith('Failed') ? 'red' : 'var(--accent)' }}>
          {message}
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Add form */}
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wide mb-4" style={{ color: 'var(--muted)' }}>
            {editingId ? 'Edit event' : 'Add event'}
          </h2>
          <form onSubmit={submit} className="flex flex-col gap-3">
            <Input
              placeholder="Event name *"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
            <Input
              placeholder="Organizer"
              value={form.organizer}
              onChange={e => set('organizer', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>Start date *</label>
                <Input
                  type="date"
                  value={form.start_date}
                  onChange={e => set('start_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>End date</label>
                <Input
                  type="date"
                  value={form.end_date}
                  onChange={e => set('end_date', e.target.value)}
                />
              </div>
            </div>
            <Input
              placeholder="Location (e.g. London, UK)"
              value={form.location}
              onChange={e => set('location', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>Format</label>
                <select
                  value={form.format}
                  onChange={e => set('format', e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  <option value="in-person">In-person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>Category</label>
                <select
                  value={form.category}
                  onChange={e => set('category', e.target.value)}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  <option value="conference">Conference</option>
                  <option value="summit">Summit</option>
                </select>
              </div>
            </div>
            <Input
              placeholder="URL"
              type="url"
              value={form.url}
              onChange={e => set('url', e.target.value)}
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={3}
              className="w-full rounded-lg px-3 py-2 text-sm resize-y"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            />
            <Input
              placeholder="Tags (comma-separated)"
              value={form.tags}
              onChange={e => set('tags', e.target.value)}
            />

            {duplicate && (
              <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--text)' }}>
                <p className="font-medium mb-1" style={{ color: 'rgb(239,68,68)' }}>Event already exists</p>
                <p style={{ color: 'var(--muted)' }}>
                  &ldquo;{duplicate.name}&rdquo; ({duplicate.start_date}
                  {duplicate.end_date && duplicate.end_date !== duplicate.start_date ? ` – ${duplicate.end_date}` : ''})
                  is already in the calendar.{' '}
                  <Link
                    href="/compass/events"
                    target="_blank"
                    className="underline underline-offset-2"
                    style={{ color: 'var(--accent)' }}
                  >
                    View events calendar →
                  </Link>
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={saving || !!duplicate}>
                {saving ? (editingId ? 'Saving…' : 'Adding…') : (editingId ? 'Save changes' : 'Add event')}
              </Button>
              {editingId && (
                <Button type="button" variant="secondary" onClick={cancelEdit}>Cancel</Button>
              )}
            </div>
          </form>
        </div>

        {/* Events list */}
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wide mb-4" style={{ color: 'var(--muted)' }}>
            {events.length} event{events.length !== 1 ? 's' : ''}
            {isDbBacked ? ' (from database)' : ' (static)'}
          </h2>
          <div className="flex flex-col gap-3">
            {events.map(ev => (
              <Card key={ev.id} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{ev.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                      {ev.start_date}{ev.end_date && ev.end_date !== ev.start_date ? ` → ${ev.end_date}` : ''} · {ev.location || '—'}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                      {ev.organizer} · {ev.format} · {ev.category}
                    </p>
                  </div>
                  {isDbBacked && (
                    <div className="flex gap-2 shrink-0">
                      <Button size="sm" variant="secondary" onClick={() => startEdit(ev)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => remove(ev.id)}>Delete</Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
