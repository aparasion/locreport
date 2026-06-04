import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { articleHref } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Reports — LocReport',
  description: 'Periodic synthesis reports on the language services industry — monthly roundups and annual global market analysis.',
}

export const revalidate = 3600

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, published_at')
    .eq('article_type', 'monthly-summary')
    .order('published_at', { ascending: false })

  const monthly = data ?? []

  return (
    <div className="container" style={{ paddingBottom: 'var(--space-12)' }}>
      <section className="intel-hero">
        <h1>Reports</h1>
        <p className="intel-subtitle">Synthesis reports on the language services industry, published on a monthly and annual basis.</p>
      </section>

      {/* Annual */}
      <section style={{ marginBottom: 'var(--space-10)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-4)', borderBottom: '2px solid var(--border)', paddingBottom: 'var(--space-3)' }}>Annual</h2>
        <div className="reports-list">
          <Link href="/reports/2026-annual-global-market-report" className="report-card">
            <div className="report-card__meta">
              <span className="report-card__type">Annual Report</span>
              <span className="report-card__date">April 2026</span>
            </div>
            <h3 className="report-card__title">2026 Annual Global Market Report</h3>
            <p className="report-card__desc">A data-rich strategic brief covering market evolution, AI disruption, competitive dynamics, and forward-looking implications for language services stakeholders.</p>
            <span className="report-card__cta">Read report →</span>
          </Link>
        </div>
      </section>

      {/* Monthly */}
      <section>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 'var(--space-4)', borderBottom: '2px solid var(--border)', paddingBottom: 'var(--space-3)' }}>Monthly</h2>
        {monthly.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontStyle: 'italic' }}>No monthly reports have been published yet.</p>
        ) : (
          <div className="reports-list">
            {monthly.map(r => (
              <Link key={r.id} href={articleHref(r.slug)} className="report-card">
                <div className="report-card__meta">
                  <span className="report-card__type">Monthly Report</span>
                  <span className="report-card__date">
                    {new Date(r.published_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
                <h3 className="report-card__title">{r.title}</h3>
                {r.excerpt && <p className="report-card__desc">{r.excerpt}</p>}
                <span className="report-card__cta">Read report →</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
