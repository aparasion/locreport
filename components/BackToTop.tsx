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

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      style={{
        position: 'fixed',
        bottom: '1.75rem',
        right: '1.75rem',
        zIndex: 50,
        width: '2.75rem',
        height: '2.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        background: 'var(--accent)',
        color: '#fff',
        border: '1.5px solid var(--accent)',
        cursor: 'pointer',
        boxShadow: '0 4px 20px rgba(53,80,245,0.30), 0 1px 4px rgba(0,0,0,0.10)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transform: visible ? 'translateY(0)' : 'translateY(0.5rem)',
        transition: 'opacity 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--accent-hover)'
        e.currentTarget.style.borderColor = 'var(--accent-hover)'
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(53,80,245,0.40), 0 1px 4px rgba(0,0,0,0.12)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'var(--accent)'
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(53,80,245,0.30), 0 1px 4px rgba(0,0,0,0.10)'
      }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  )
}
