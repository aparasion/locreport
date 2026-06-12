import type { Metadata } from 'next'
import Link from 'next/link'
import { Nav } from '@/components/Nav'

export const metadata: Metadata = {
  title: 'Page Not Found — LocReport',
  description: 'The page you are looking for does not exist. Explore LocReport for the latest in translation, localization, and language technology.',
  robots: { index: false, follow: true },
}

const LINKS = [
  {
    href: '/articles',
    label: 'Latest Articles',
    desc: 'Daily coverage of translation, AI, and localization industry developments.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    ),
  },
  {
    href: '/intelligence',
    label: 'Intelligence',
    desc: 'Active signals tracking structural shifts across the language services market.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
  {
    href: '/reports/monthly',
    label: 'Monthly Reports',
    desc: 'Curated monthly synthesis of the most important industry movements.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: '/compass',
    label: 'Compass',
    desc: 'LocStock, LLM pricing, industry directory, and events — all in one place.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
  },
  {
    href: '/intelligence/high-impact',
    label: 'High-Impact News',
    desc: 'The most consequential stories filtered by impact score.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    href: '/about',
    label: 'About LocReport',
    desc: 'An independent publication tracking the pulse of global language services.',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
]

export default function NotFound() {
  return (
    <>
      <Nav />
      <style>{`
        .nf-card {
          display: flex; align-items: flex-start; gap: 1rem;
          background: var(--surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 1.25rem 1.4rem;
          box-shadow: var(--card-shadow); text-decoration: none;
          transition: box-shadow 0.2s, border-color 0.2s, transform 0.15s;
        }
        .nf-card:hover {
          box-shadow: var(--card-shadow-hover);
          border-color: var(--accent);
          transform: translateY(-2px);
        }
      `}</style>
      <main style={{ minHeight: '80vh', background: 'var(--bg)', paddingBottom: 'var(--space-16)' }}>

        {/* Hero band */}
        <section style={{
          background: 'var(--featured-bg)',
          padding: 'var(--space-12) var(--page-gutter)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative blurred orbs */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 60% 50% at 20% 50%, rgba(53,80,245,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 80% 40%, rgba(181,116,15,0.12) 0%, transparent 70%)',
          }} />

          <div style={{ position: 'relative', maxWidth: 'var(--content-width)', margin: '0 auto' }}>
            {/* 404 badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'rgba(53,80,245,0.18)', border: '1px solid rgba(107,131,255,0.3)',
              borderRadius: 'var(--radius-xl)', padding: '0.3rem 1rem',
              marginBottom: 'var(--space-5)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--accent-light)', letterSpacing: '0.1em', fontWeight: 600 }}>
                ERROR 404
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'clamp(2rem, 5vw, 3.25rem)', lineHeight: 1.15,
              color: 'var(--featured-text)', margin: '0 0 var(--space-4)',
              letterSpacing: '-0.02em',
            }}>
              Lost in translation&hellip;?
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: 'var(--featured-muted)',
              margin: '0 0 var(--space-6)', lineHeight: 1.65, maxWidth: '520px', marginInline: 'auto',
            }}>
              This page doesn&rsquo;t exist — or it may have moved as the industry evolves. The language services world shifts fast; apparently so do URLs.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                background: 'var(--accent)', color: '#fff',
                padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-md)',
                fontWeight: 600, fontSize: '0.95rem', transition: 'background 0.2s',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Back to home
              </Link>
              <Link href="/articles" style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                background: 'rgba(255,255,255,0.08)', color: 'var(--featured-text)',
                border: '1px solid rgba(255,255,255,0.15)',
                padding: '0.6rem 1.4rem', borderRadius: 'var(--radius-md)',
                fontWeight: 500, fontSize: '0.95rem',
              }}>
                Browse articles
              </Link>
            </div>
          </div>
        </section>

        {/* Navigation grid */}
        <section style={{
          maxWidth: 'var(--site-max-width)', margin: '0 auto',
          padding: 'var(--space-10) var(--page-gutter) 0',
        }}>
          <p style={{
            fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: 'var(--space-5)',
          }}>
            Where would you like to go?
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-4)',
          }}>
            {LINKS.map(({ href, label, desc, icon }) => (
              <Link key={href} href={href} className="nf-card">
                <span style={{
                  flexShrink: 0, width: '40px', height: '40px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {icon}
                </span>
                <span>
                  <span style={{
                    display: 'block', fontWeight: 600, fontSize: '0.95rem',
                    color: 'var(--text)', marginBottom: '0.25rem',
                    fontFamily: 'var(--font-display)',
                  }}>
                    {label}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.55 }}>
                    {desc}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Search nudge */}
        <section style={{
          maxWidth: 'var(--site-max-width)', margin: '0 auto',
          padding: 'var(--space-8) var(--page-gutter) 0',
        }}>
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)', padding: 'var(--space-6) var(--space-6)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 'var(--space-4)', flexWrap: 'wrap',
          }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text)', margin: 0, fontFamily: 'var(--font-display)' }}>
                Looking for something specific?
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--muted)', margin: '0.25rem 0 0' }}>
                Use site search to find articles, signals, and reports by keyword.
              </p>
            </div>
            <Link href="/search" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              background: 'var(--accent)', color: '#fff',
              padding: '0.55rem 1.2rem', borderRadius: 'var(--radius-md)',
              fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap',
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Search LocReport
            </Link>
          </div>
        </section>

      </main>
    </>
  )
}
