'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { marked } from 'marked'
import { Draft } from '@/lib/types'
import { Button } from '@/components/ui/button'

export default function DraftReviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [tab, setTab] = useState<'preview' | 'edit'>('preview')
  const [content, setContent] = useState('')
  const [impactScore, setImpactScore] = useState(() => searchParams.get('impact_score') ?? '')
  const [timeHorizon, setTimeHorizon] = useState(() => searchParams.get('time_horizon') ?? '')
  const [loading, setLoading] = useState(false)
  const [rerunning, setRerunning] = useState(false)
  const [confirmRerun, setConfirmRerun] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/drafts/${id}`)
      .then(r => r.json())
      .then((d: Draft) => {
        setDraft(d)
        setContent(d.content)
      })
      .catch(() => setError('Failed to load draft.'))
  }, [id])

  async function action(status: 'approved' | 'rejected') {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/drafts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          content,
          impact_score: impactScore ? Number(impactScore) : null,
          time_horizon: timeHorizon || null,
        }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? `Server error (${res.status})`)
        setLoading(false)
        return
      }
    } catch {
      setError('Network error — please try again.')
      setLoading(false)
      return
    }
    router.push('/admin/drafts')
  }

  async function rerun() {
    setConfirmRerun(false)
    setRerunning(true)
    setError('')
    setDraft(d => d ? { ...d, status: 'rerunning' } : d)
    try {
      const res = await fetch(`/api/drafts/${id}/rerun`, { method: 'POST' })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? `Re-run failed (${res.status})`)
        setDraft(d => d ? { ...d, status: 'pending' } : d)
        setRerunning(false)
        return
      }
      const updated: Draft = await res.json()
      setDraft(updated)
      setContent(updated.content)
      setTab('preview')
    } catch {
      setError('Network error during re-run.')
      setDraft(d => d ? { ...d, status: 'pending' } : d)
    }
    setRerunning(false)
  }

  if (!draft) return <p className="text-[#5A6278]">Loading…</p>

  const isPending = draft.status === 'pending' || draft.status === 'rerun'

  return (
    <div className="max-w-[760px]">
      <h1 className="text-2xl font-bold text-[#111827] mb-2">{draft.title}</h1>
      {draft.source_url && (
        <a href={draft.source_url} target="_blank" rel="noopener"
          className="text-sm text-[#3D5AFE] hover:underline mb-4 block">
          View source →
        </a>
      )}

      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-xs text-[#5A6278] mb-1">Impact score (1–5)</label>
          <select
            value={impactScore}
            onChange={e => setImpactScore(e.target.value)}
            className="rounded-md border border-gray-200 px-2 py-1 text-sm"
          >
            <option value="">—</option>
            {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#5A6278] mb-1">Time horizon</label>
          <select
            value={timeHorizon}
            onChange={e => setTimeHorizon(e.target.value)}
            className="rounded-md border border-gray-200 px-2 py-1 text-sm"
          >
            <option value="">—</option>
            <option value="now">Now</option>
            <option value="6months">6 months</option>
            <option value="2years">2 years</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-100 mb-4">
        {(['preview', 'edit'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${
              tab === t ? 'border-b-2 border-[#3D5AFE] text-[#3D5AFE]' : 'text-[#5A6278]'
            }`}>
            {t}
          </button>
        ))}
      </div>

      {rerunning ? (
        <div className="py-12 text-center text-[#5A6278] text-sm">
          <div className="mb-3 text-2xl">⟳</div>
          Re-running article through the full generation pipeline…
        </div>
      ) : tab === 'preview' ? (
        <div className="prose" dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }} />
      ) : (
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={24}
          className="w-full font-mono text-sm border border-gray-200 rounded-lg p-4 focus:outline-none focus:border-[#3D5AFE]"
        />
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {confirmRerun && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-center justify-between gap-4">
          <span>Re-run this article through the full 2-stage pipeline? The current content will be replaced.</span>
          <div className="flex gap-2 shrink-0">
            <Button onClick={rerun}>Confirm</Button>
            <Button variant="ghost" onClick={() => setConfirmRerun(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {isPending && !rerunning && (
        <div className="flex gap-3 mt-6">
          <Button onClick={() => action('approved')} disabled={loading}>Approve & publish</Button>
          <Button variant="danger" onClick={() => action('rejected')} disabled={loading}>Reject</Button>
          <Button variant="secondary" onClick={() => setConfirmRerun(true)} disabled={loading || confirmRerun}>Re-run</Button>
          <Button variant="ghost" onClick={() => router.back()}>Back</Button>
        </div>
      )}
    </div>
  )
}
