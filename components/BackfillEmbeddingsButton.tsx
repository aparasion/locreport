'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

type State = 'idle' | 'running' | 'done' | 'error'

// Runs /api/admin/backfill-embeddings in a loop until every article has a
// vector, so one click completes the whole backfill.
export function BackfillEmbeddingsButton() {
  const [state, setState] = useState<State>('idle')
  const [progress, setProgress] = useState<{ embedded: number; remaining: number } | null>(null)

  async function run() {
    setState('running')
    let totalEmbedded = 0
    try {
      // Hard cap keeps a stuck API from looping forever
      for (let round = 0; round < 50; round++) {
        const res = await fetch('/api/admin/backfill-embeddings', { method: 'POST' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: { embedded: number; remaining: number } = await res.json()
        totalEmbedded += data.embedded
        setProgress({ embedded: totalEmbedded, remaining: data.remaining })
        if (data.remaining === 0) break
        if (data.embedded === 0) throw new Error('No progress — check server logs')
      }
      setState('done')
    } catch {
      setState('error')
    }
  }

  if (state === 'running') {
    return (
      <Button size="sm" variant="secondary" disabled>
        <span className="animate-pulse">
          Embedding…{progress ? ` ${progress.remaining} left` : ''}
        </span>
      </Button>
    )
  }

  if (state === 'done') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
          {progress && progress.embedded > 0
            ? `${progress.embedded} article${progress.embedded !== 1 ? 's' : ''} embedded`
            : 'All articles embedded'}
        </span>
        <Button size="sm" variant="ghost" onClick={() => { setState('idle'); setProgress(null) }}>↺</Button>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: 'var(--destructive, #e53e3e)' }}>Failed</span>
        <Button size="sm" variant="ghost" onClick={() => setState('idle')}>↺</Button>
      </div>
    )
  }

  return (
    <Button size="sm" variant="secondary" onClick={run}>
      Backfill embeddings
    </Button>
  )
}
