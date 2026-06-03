'use client'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ articles: number; drafts: number; sources: number } | null>(null)
  const [ingesting, setIngesting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats)
  }, [])

  async function runIngest() {
    setIngesting(true)
    setMessage('')
    const res = await fetch('/api/ingest', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}` },
    })
    const data = await res.json()
    setMessage(res.ok ? `Ingest complete: ${data.processed} new drafts created.` : data.error)
    setIngesting(false)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-8">
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

      <div className="flex items-center gap-4">
        <Button onClick={runIngest} disabled={ingesting}>
          {ingesting ? 'Running ingest…' : 'Run ingest now'}
        </Button>
        {message && <p className="text-sm text-[#5A6278]">{message}</p>}
      </div>
    </div>
  )
}
