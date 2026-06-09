'use client'

import { useEffect, useState } from 'react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.5rem 0.875rem',
        borderRadius: 'var(--radius-md, 10px)',
        background: 'var(--accent)',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.8125rem',
        fontWeight: 600,
        fontFamily: 'var(--font-body)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.18)',
        transition: 'background 0.15s, transform 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = 'var(--accent-hover)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="18 15 12 9 6 15" />
      </svg>
      Top
    </button>
  )
}
