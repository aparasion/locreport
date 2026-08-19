'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { IngestButton, type IngestResult } from '@/components/IngestButton'
import { BackfillEmbeddingsButton } from '@/components/BackfillEmbeddingsButton'

type Confirm = 'ingest' | 'monthly' | 'monthly-force' | null
type Frequency = 'daily' | 'weekly'
type DigestPreview = { frequency: Frequency; recipients: number; skipped: number; articles: number }

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ articles: number; drafts: number; sources: number } | null>(null)
  const [monthlyRunning, setMonthlyRunning] = useState(false)
  const [quotesRunning, setQuotesRunning] = useState(false)
  const [pricingRunning, setPricingRunning] = useState(false)
  const [digestPreviewing, setDigestPreviewing] = useState<Frequency | null>(null)
  const [digestSending, setDigestSending] = useState(false)
  const [digestPreview, setDigestPreview] = useState<DigestPreview | null>(null)
  const [backfillRunning, setBackfillRunning] = useState(false)
  const [backfillSlug, setBackfillSlug] = useState('')
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

  function refreshStats() {
    fetch('/api/stats').then(r => r.json()).then(setStats)
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

  async function backfillFacts() {
    const slug = backfillSlug.trim()
    if (!slug) return
    setBackfillRunning(true)
    flash('')
    const res = await fetch('/api/admin/backfill-facts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
    const data = await res.json()
    flash(
      res.ok
        ? `Backfilled ${data.facts_saved} facts for "${slug}".`
        : (data.error ?? data.message ?? 'Backfill failed.'),
      res.ok ? 'ok' : 'error',
    )
    if (res.ok) setBackfillSlug('')
    setBackfillRunning(false)
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

  async function refreshPricing() {
    setPricingRunning(true)
    flash('')
    const res = await fetch('/api/llm-pricing', { method: 'POST' })
    const data = await res.json()
    flash(
      res.ok ? `LLM pricing updated: ${data.updated} models (${data.failed} failed).` : (data.error ?? 'Update failed.'),
      res.ok ? 'ok' : 'error',
    )
    setPricingRunning(false)
  }

  // Sending a digest emails real subscribers and can't be undone, so the
  // buttons resolve the recipient list first (dry run) and only send once the
  // admin confirms against those numbers.
  async function previewDigest(frequency: Frequency) {
    setDigestPreviewing(frequency)
    setDigestPreview(null)
    flash('')
    try {
      const res = await fetch(`/api/digest/send?frequency=${frequency}&dry=1`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        flash(data.error ?? 'Digest preview failed.', 'error')
        return
      }
      setDigestPreview({
        frequency,
        recipients: data.recipients ?? 0,
        skipped: data.skipped ?? 0,
        articles: data.articles ?? 0,
      })
    } catch {
      flash('Digest preview failed.', 'error')
    } finally {
      setDigestPreviewing(null)
    }
  }

  async function sendDigest(frequency: Frequency) {
    setDigestSending(true)
    flash('')
    try {
      const res = await fetch(`/api/digest/send?frequency=${frequency}`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        flash(data.error ?? 'Digest send failed.', 'error')
        return
      }
      const errors: string[] = data.errors ?? []
      flash(
        `${frequency === 'daily' ? 'Daily' : 'Weekly'} digest sent to ${data.sent} subscriber${data.sent !== 1 ? 's' : ''}` +
          ` — ${data.skipped} skipped, ${data.articles} article${data.articles !== 1 ? 's' : ''} in period.` +
          (errors.length ? ` ${errors.length} error${errors.length !== 1 ? 's' : ''}: ${errors.join('; ')}` : ''),
        errors.length ? 'error' : 'ok',
      )
      setDigestPreview(null)
    } catch {
      flash('Digest send failed — it may still have gone out. Check Resend before retrying.', 'error')
    } finally {
      setDigestSending(false)
    }
  }

  const now = new Date()
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    .toLocaleString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Dashboard</h1>

      <div className="admin-stats-banner">
        {[
          { label: 'Published', value: stats?.articles, href: '/admin/articles' },
          { label: 'Drafts', value: stats?.drafts, href: '/admin/drafts', danger: true },
          { label: 'Sources', value: stats?.sources, href: '/admin/sources' },
        ].map(({ label, value, href, danger }) => (
          <span key={label} className="admin-stats-banner__item">
            <Link
              href={href}
              className={`admin-stats-banner__value${danger ? ' admin-stats-banner__value--danger' : ''}`}
            >
              {value ?? '—'}
            </Link>
            <span className="admin-stats-banner__label">{label}</span>
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-6 max-w-[640px]">

        {/* Ingest */}
        <div className="p-4 rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="font-medium" style={{ color: 'var(--text)' }}>Run ingest</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                Fetch all active RSS sources and create new pending drafts.
                Runs automatically via GitHub Actions at 10:30 UTC daily.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={() => { setConfirm('ingest' as Confirm); flash('') }}
              disabled={confirm === 'ingest'}
              className="shrink-0 self-start"
            >
              Run now
            </Button>
          </div>
          {confirm === 'ingest' && (
            <div className="mt-3 pt-3 flex flex-wrap items-center gap-3 text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}>
              <span>Fetch all active RSS sources and create new pending drafts. Continue?</span>
              <IngestButton
                label="Confirm"
                onDone={(result: IngestResult) => { setConfirm(null); refreshStats(); flash(`+${result.processed} draft${result.processed !== 1 ? 's' : ''} created, ${result.skipped} skipped.`) }}
              />
              <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            </div>
          )}
        </div>

        {/* Embeddings backfill */}
        <div className="p-4 rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="font-medium" style={{ color: 'var(--text)' }}>Backfill embeddings</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                Generate semantic-search vectors for articles that don&apos;t have one yet.
                New articles are embedded automatically on publish.
              </p>
            </div>
            <div className="shrink-0 self-start">
              <BackfillEmbeddingsButton />
            </div>
          </div>
        </div>

        {/* Monthly report */}
        <div className="p-4 rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="font-medium" style={{ color: 'var(--text)' }}>Generate monthly report</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                Synthesise all {prevMonth} industry articles into a full monthly report.
                Trigger manually or add a scheduled workflow to GitHub Actions for the 1st of each month.
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
            <div className="mt-3 pt-3 flex flex-wrap items-center gap-3 text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}>
              <span>This will generate and publish a monthly report for <strong>{prevMonth}</strong> using all industry articles from that period. Continue?</span>
              <Button onClick={() => runMonthly(false)} disabled={monthlyRunning}>Confirm</Button>
              <Button variant="ghost" onClick={() => setConfirm(null)}>Cancel</Button>
            </div>
          )}
          {(confirm as string) === 'monthly-force' && (
            <div className="mt-3 pt-3 flex flex-wrap items-center gap-3 text-sm text-yellow-700" style={{ borderTop: '1px solid var(--border)' }}>
              <span>A report for this period already exists. Generate a new one anyway?</span>
              <Button onClick={() => runMonthly(true)} disabled={monthlyRunning}>Yes, regenerate</Button>
              <Button variant="ghost" onClick={() => { setConfirm(null); flash('') }}>Cancel</Button>
            </div>
          )}
        </div>

        {/* Digest send */}
        <div className="p-4 rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="font-medium" style={{ color: 'var(--text)' }}>Send digest</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                Email the digest to active subscribers on that frequency.
                Runs automatically via GitHub Actions — weekly Fridays 1pm, daily workdays 4pm (Central European time).
                Subscribers already sent this period are skipped, so a manual run is safe to repeat.
              </p>
            </div>
            <div className="flex gap-2 shrink-0 self-start">
              {(['daily', 'weekly'] as Frequency[]).map(frequency => (
                <Button
                  key={frequency}
                  variant="secondary"
                  onClick={() => previewDigest(frequency)}
                  disabled={!!digestPreviewing || digestSending}
                >
                  {digestPreviewing === frequency
                    ? 'Checking…'
                    : frequency === 'daily' ? 'Daily' : 'Weekly'}
                </Button>
              ))}
            </div>
          </div>
          {digestPreview && (
            <div className="mt-3 pt-3 flex flex-wrap items-center gap-3 text-sm" style={{ borderTop: '1px solid var(--border)', color: 'var(--muted)' }}>
              {digestPreview.recipients === 0 ? (
                <>
                  <span>
                    Nobody would receive the <strong>{digestPreview.frequency}</strong> digest right now
                    ({digestPreview.articles} article{digestPreview.articles !== 1 ? 's' : ''} in period,
                    {' '}{digestPreview.skipped} subscriber{digestPreview.skipped !== 1 ? 's' : ''} skipped).
                  </span>
                  <Button variant="ghost" onClick={() => setDigestPreview(null)}>Close</Button>
                </>
              ) : (
                <>
                  <span>
                    The <strong>{digestPreview.frequency}</strong> digest will go to{' '}
                    <strong>{digestPreview.recipients} subscriber{digestPreview.recipients !== 1 ? 's' : ''}</strong>
                    {' '}({digestPreview.skipped} skipped, {digestPreview.articles} article{digestPreview.articles !== 1 ? 's' : ''} in period).
                    This sends real email. Continue?
                  </span>
                  <Button onClick={() => sendDigest(digestPreview.frequency)} disabled={digestSending}>
                    {digestSending ? 'Sending…' : `Send to ${digestPreview.recipients}`}
                  </Button>
                  <Button variant="ghost" onClick={() => setDigestPreview(null)} disabled={digestSending}>Cancel</Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Backfill facts */}
        <div className="p-4 rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="font-medium mb-0.5" style={{ color: 'var(--text)' }}>Backfill Fact Flow</p>
          <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>
            Re-fetch and extract facts from an article&apos;s source URL. Use for articles ingested before Fact Flow was enabled.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={backfillSlug}
              onChange={e => setBackfillSlug(e.target.value)}
              placeholder="article-slug"
              className="flex-1 text-sm px-3 py-2 rounded-md border"
              style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
              onKeyDown={e => { if (e.key === 'Enter') backfillFacts() }}
              disabled={backfillRunning}
            />
            <Button variant="secondary" onClick={backfillFacts} disabled={backfillRunning || !backfillSlug.trim()} className="shrink-0">
              {backfillRunning ? 'Extracting…' : 'Backfill facts'}
            </Button>
          </div>
        </div>

        {/* Market quotes */}
        <div className="p-4 rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="font-medium" style={{ color: 'var(--text)' }}>Refresh market quotes</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                Fetch latest prices and 30-day history for all LocStock tickers.
                Set a daily cron-job.org job to POST /api/market-quotes.
              </p>
            </div>
            <Button variant="secondary" onClick={refreshQuotes} disabled={quotesRunning} className="shrink-0 self-start">
              {quotesRunning ? 'Refreshing…' : 'Refresh now'}
            </Button>
          </div>
        </div>

        {/* LLM pricing */}
        <div className="p-4 rounded-lg border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="font-medium" style={{ color: 'var(--text)' }}>Refresh LLM pricing</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                Fetch current per-token pricing for tracked models from OpenRouter and log any price changes.
                Set a daily cron-job.org job to POST /api/llm-pricing.
              </p>
            </div>
            <Button variant="secondary" onClick={refreshPricing} disabled={pricingRunning} className="shrink-0 self-start">
              {pricingRunning ? 'Refreshing…' : 'Refresh now'}
            </Button>
          </div>
        </div>

        {message && (
          <p className={`text-sm ${messageType === 'error' ? 'text-red-600' : ''}`} style={messageType !== 'error' ? { color: 'var(--muted)' } : {}}>
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
