'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function ReadingProgress() {
  const [pct, setPct] = useState(0)
  const pathname = usePathname()
  const isArticle = pathname.startsWith('/articles/') && pathname.split('/').length > 2

  useEffect(() => {
    if (!isArticle) { setPct(0); return }

    function update() {
      const article = document.querySelector('article.post') as HTMLElement | null
      if (!article) return
      const top = article.getBoundingClientRect().top + window.scrollY
      const total = article.offsetHeight - window.innerHeight
      const scrolled = window.scrollY - top
      const p = total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0
      setPct(p)
    }

    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [isArticle, pathname])

  if (!isArticle) return null

  return (
    <div
      className="read-progress-bar"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label="Reading progress"
      style={{ width: `${pct}%` }}
    />
  )
}
