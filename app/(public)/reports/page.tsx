import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reports — LocReport',
  description: 'Periodic synthesis reports on the language services industry — monthly roundups and annual global market analysis.',
  alternates: { canonical: '/reports' },
}

export default function ReportsPage() {
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
        <div className="reports-list">
          <Link href="/reports/monthly" className="report-card">
            <div className="report-card__meta">
              <span className="report-card__type">Monthly Reports</span>
            </div>
            <h3 className="report-card__title">Monthly Industry Intelligence</h3>
            <p className="report-card__desc">Each month we scan hundreds of sources across translation, AI, and language technology — then distill the signals that matter for localization leaders.</p>
            <span className="report-card__cta">Browse all monthly reports →</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
