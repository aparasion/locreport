'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Draft } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

function statusVariant(status: Draft['status']) {
  if (status === 'approved') return 'success'
  if (status === 'rejected') return 'danger'
  if (status === 'rerun') return 'rerun'
  if (status === 'rerunning') return 'muted'
  return 'warning'
}

function statusLabel(status: Draft['status']) {
  if (status === 'rerun') return 'Re-run draft'
  if (status === 'rerunning') return 'Re-running…'
  return status
}

const STATUS_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Re-run', value: 'rerun' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

export default function DraftsPage() {
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status') ?? ''

  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkBusy, setBulkBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setSelected(new Set())
    try {
      const url = statusFilter ? `/api/drafts?status=${statusFilter}` : '/api/drafts'
      const r = await fetch(url)
      const data = await r.json()
      // api/drafts GET doesn't filter by status yet — filter client-side
      const filtered = statusFilter ? (data as Draft[]).filter(d => d.status === statusFilter) : data
      setDrafts(filtered)
    } catch {
      setError('Failed to load drafts.')
    }
    setLoading(false)
  }, [statusFilter])

  useEffect(() => { load() }, [load])

  function toggleAll() {
    if (selected.size === drafts.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(drafts.map(d => d.id)))
    }
  }

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  async function bulkReject() {
    if (!selected.size) return
    setBulkBusy(true)
    await fetch('/api/drafts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selected), status: 'rejected' }),
    })
    await load()
    setBulkBusy(false)
  }

  const allSelected = drafts.length > 0 && selected.size === drafts.length
  const someSelected = selected.size > 0

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#111827]">Drafts</h1>
        <div className="flex gap-2">
          {STATUS_FILTERS.map(({ label, value }) => (
            <a
              key={value}
              href={value ? `/admin/drafts?status=${value}` : '/admin/drafts'}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                statusFilter === value
                  ? 'bg-[#3D5AFE] text-white'
                  : 'bg-[#EEF1F8] text-[#5A6278] hover:bg-[#E0E4F0]'
              }`}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {someSelected && (
        <div className="flex items-center gap-3 mb-4 px-3 py-2 bg-[#EEF1F8] rounded-lg">
          <span className="text-sm text-[#5A6278]">{selected.size} selected</span>
          <button
            onClick={bulkReject}
            disabled={bulkBusy}
            className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            {bulkBusy ? 'Rejecting…' : 'Reject selected'}
          </button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-[#5A6278] hover:text-[#111827] ml-auto"
          >
            Clear
          </button>
        </div>
      )}

      <div className="max-w-[760px]">
        {!loading && drafts.length > 0 && (
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-1">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="h-4 w-4 rounded border-gray-300 text-[#3D5AFE] cursor-pointer"
              aria-label="Select all"
            />
            <span className="text-xs text-[#5A6278]">Select all</span>
          </div>
        )}

        {loading && <p className="text-[#5A6278] text-sm">Loading…</p>}

        {!loading && drafts.map(draft => {
          const date = new Date(draft.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          return (
            <div key={draft.id} className="border-b border-gray-100 py-4 last:border-0 flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(draft.id)}
                onChange={() => toggle(draft.id)}
                className="h-4 w-4 mt-0.5 rounded border-gray-300 text-[#3D5AFE] cursor-pointer shrink-0"
                aria-label={`Select ${draft.title}`}
              />
              <div className="flex-1 flex items-start justify-between gap-4">
                <div>
                  <Link href={`/admin/drafts/${draft.id}`} className="font-medium text-[#111827] hover:text-[#3D5AFE]">
                    {draft.title}
                  </Link>
                  <p className="text-xs text-[#5A6278] mt-1">
                    {date}{draft.source_url && (() => { try { return ` · ${new URL(draft.source_url!).hostname}` } catch { return ` · ${draft.source_url}` } })()}
                  </p>
                </div>
                <Badge variant={statusVariant(draft.status)}>{statusLabel(draft.status)}</Badge>
              </div>
            </div>
          )
        })}

        {!loading && !drafts.length && <p className="text-[#5A6278] text-sm">No drafts found.</p>}
      </div>
    </div>
  )
}
