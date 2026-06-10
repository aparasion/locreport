'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

type IngestState = 'idle' | 'confirm' | 'running' | 'done' | 'error'
export type IngestResult = { processed: number; skipped: number; errors: string[] }

interface Props {
  label: string
  sourceIds?: string[]   // empty/omitted = all active sources
  requireConfirm?: boolean
  confirmMessage?: string
  onDone?: (result: IngestResult) => void
}

export function IngestButton({ label, sourceIds, requireConfirm, confirmMessage, onDone }: Props) {
  const [state, setState] = useState<IngestState>('idle')
  const [result, setResult] = useState<IngestResult | null>(null)

  async function run() {
    setState('running')
    setResult(null)
    try {
      const params = sourceIds?.length ? `?sources=${sourceIds.join(',')}` : ''
      const res = await fetch(`/api/ingest${params}`, { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: IngestResult = await res.json()
      setResult(data)
      setState('done')
      onDone?.(data)
    } catch {
      setState('error')
    }
  }

  function reset() {
    setState('idle')
    setResult(null)
  }

  if (state === 'confirm') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--muted)' }}>
          {confirmMessage ?? 'Fetch all active sources and create pending drafts?'}
        </span>
        <Button size="sm" onClick={run}>Confirm</Button>
        <Button size="sm" variant="ghost" onClick={reset}>Cancel</Button>
      </div>
    )
  }

  if (state === 'running') {
    return (
      <Button size="sm" variant="secondary" disabled>
        <span className="animate-pulse">Running…</span>
      </Button>
    )
  }

  if (state === 'done' && result) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium" style={{ color: result.processed > 0 ? 'var(--accent)' : 'var(--muted)' }}>
          {result.processed > 0
            ? `+${result.processed} draft${result.processed !== 1 ? 's' : ''} created`
            : '0 fresh items'}
        </span>
        {result.processed > 0 && (
          <Link
            href="/admin/drafts"
            className="text-sm underline underline-offset-2"
            style={{ color: 'var(--accent)' }}
          >
            Review drafts →
          </Link>
        )}
        <Button size="sm" variant="ghost" onClick={reset}>↺</Button>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--destructive, #e53e3e)' }}>Failed</span>
        <Button size="sm" variant="ghost" onClick={reset}>↺</Button>
      </div>
    )
  }

  return (
    <Button size="sm" variant="secondary" onClick={requireConfirm ? () => setState('confirm') : run}>
      {label}
    </Button>
  )
}
