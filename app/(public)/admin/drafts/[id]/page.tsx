'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { marked } from 'marked'
import { Draft } from '@/lib/types'
import { Button } from '@/components/ui/button'

export default function DraftReviewPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [draft, setDraft] = useState<Draft | null>(null)
  const [tab, setTab] = useState<'preview' | 'edit'>('preview')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
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
        body: JSON.stringify({ status, content }),
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

  if (!draft) return <p className="text-[#5A6278]">Loading…</p>

  return (
    <div className="max-w-[760px]">
      <h1 className="text-2xl font-bold text-[#111827] mb-2">{draft.title}</h1>
      {draft.source_url && (
        <a href={draft.source_url} target="_blank" rel="noopener"
          className="text-sm text-[#3D5AFE] hover:underline mb-4 block">
          View source →
        </a>
      )}

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

      {tab === 'preview' ? (
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

      {draft.status === 'pending' && (
        <div className="flex gap-3 mt-6">
          <Button onClick={() => action('approved')} disabled={loading}>Approve & publish</Button>
          <Button variant="danger" onClick={() => action('rejected')} disabled={loading}>Reject</Button>
          <Button variant="ghost" onClick={() => router.back()}>Back</Button>
        </div>
      )}
    </div>
  )
}
