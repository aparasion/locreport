'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Confirm = 'ingest' | 'monthly' | null

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ articles: number; drafts: number; sources: number } | null>(null)
  const [ingesting, setIngesting] = useState(false)
  const [monthlyRunning, setMonthlyRunning] = useState(false)
  const [quotesRunning, setQuotesRunning] = useState(false)
  const [confirm, setConfirm] = useState<Confirm>(null)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'ok' | 'error'>('ok')

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
  }, [])

  function flash(text: string, type: 'ok' | 'error' = 'ok') {
    setMessage(text)
    setMessageType(type)
  }

  async function runIngest() {
    setConfirm(null)
    setIngesting(true)
    flash('')
    const res = await fetch('/api/ingest', { method: 'POST' })
    const data = await res.json()
    flash(
      res.ok ? `Ingest complete: ${data.processed} new drafts created.` : (data.error ?? 'Ingest failed.'),
      res.ok ? 'ok' : 'error',
    )
    setIngesting(false)
    if (res.ok) fetch('/api/stats').then(r => r.json()).then(setStats)
  }

  async function runMonthly(force = false) {
    setConfirm(null)
    setMonthlyRunning(true)
    flash('')
    const res = await fetch('/api/monthly-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ force }),
    })
    const data = await res.json()
    if (res.status === 409 && !force) {
      // Report already exists — ask to force
      setMonthlyRunning(false)
      setConfirm('monthly-force' as Confirm)
      flash(`A monthly report for this period already exists (${data.existing_id ? `ID: ${data.existing_id}` : ''}). Confirm below to regenerate.`, 'error')
      return
    }
    flash(
      res.ok
        ? `Monthly report generated: "${data.title}" — ${data.article_count} articles summarised.`
        : (data.error ?? 'Generation failed.'),
      res.ok ? 'ok' : 'error',
    )
    setMonthlyRunning(false)
    if (res.ok) fetch('/api/stats').then(r => r.json()).then(setStats)
  }

  async function refreshQuotes() {
    setQuotesRunning(true)
    flash('')
    const res = await fetch('/api/market-quotes', { method: 'POST' })
    const data = await res.json()
    flash(
      res.ok ? `Market quotes updated: ${data.updated} tickers (${data.failed} failed).` : (data.error ?? 'Update failed.'),
      res.ok ? 'ok' : 'error',
    )
    setQuotesRunning(false)
  }

  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Published articles', value: stats?.articles },
          { label: 'Pending drafts', value: stats?.drafts },
          { label: 'RSS sources', value: stats?.sources },
        ].map(({ label, value }) => (
          <Card key={label}>
            <p className="text-sm text-[#5A6278]">{label}</p>
            <p className="text-3xl font-bold text-[#111827] mt-1">{value ?? '—'}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-6 max-w-[640px]">

        {/* Daily ingest */}
        <div className="p-4 rounded-lg border border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="font-medium text-[#111827]">Run daily ingest</p>
              <p className="text-sm text-[#5A6278] mt-0.5">Fetch RSS sources and generate new article drafts.</p>
            </div>
            <Button
              onClick={() => { setConfirm('ingest'); flash('') }}
              disabled={ingesting || confirm === 'ingest'}
              className="shrink-0 self-start"
            >
              {ingesting ? 'Running…' : 'Run now'}
            </Button>
          </div>
          {confirm === 'ingest' && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 text-sm text-[#5A6278]">
              <span>This will fetch all active RSS sources and create new pending drafts. Continue?</span>
              <Button onClick={runIngest} disabled={ingesting}>Confirm</Button>
              <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            </div>
          )}
        </div>

        {/* Monthly report */}
        <div className="p-4 rounded-lg border border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="font-medium text-[#111827]">Generate monthly report</p>
              <p className="text-sm text-[#5A6278] mt-0.5">
                Synthesise all {prevMonth} industry articles into a full monthly report.
                Auto-runs on the 1st of each month via cron-job.org.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => { setConfirm('monthly' as Confirm); flash('') }}
              disabled={monthlyRunning || confirm === 'monthly' || (confirm as string) === 'monthly-force'}
              className="shrink-0 self-start"
            >
              {monthlyRunning ? 'Generating…' : 'Run now'}
            </Button>
          </div>
          {confirm === 'monthly' && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 text-sm text-[#5A6278]">
              <span>This will generate and publish a monthly report for <strong>{prevMonth}</strong> using all industry articles from that period. Continue?</span>
              <Button onClick={() => runMonthly(false)} disabled={monthlyRunning}>Confirm</Button>
              <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            </div>
          )}
          {(confirm as string) === 'monthly-force' && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3 text-sm text-yellow-700">
              <span>A report for this period already exists. Generate a new one anyway?</span>
              <Button onClick={() => runMonthly(true)} disabled={monthlyRunning}>Yes, regenerate</Button>
              <Button variant="ghost" onClick={() => { setConfirm(null); flash('') }}>Cancel</Button>
            </div>
          )}
        </div>

        {/* Market quotes */}
        <div className="p-4 rounded-lg border border-gray-100 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="font-medium text-[#111827]">Refresh market quotes</p>
              <p className="text-sm text-[#5A6278] mt-0.5">
                Fetch latest prices and 30-day history for all LocStock tickers.
                Set a daily cron-job.org job to POST /api/market-quotes.
              </p>
            </div>
            <Button variant="secondary" onClick={refreshQuotes} disabled={quotesRunning} className="shrink-0 self-start">
              {quotesRunning ? 'Refreshing…' : 'Refresh now'}
            </Button>
          </div>
        </div>

        {message && (
          <p className={`text-sm ${messageType === 'error' ? 'text-red-600' : 'text-[#5A6278]'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
