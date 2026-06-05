'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Article } from '@/lib/types'
import { ArticleEditor } from '@/components/ArticleEditor'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function EditArticlePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [article, setArticle] = useState<Article | null>(null)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch(`/api/articles/${id}`).then(r => r.json()).then((a: Article) => {
      setArticle(a)
      setTitle(a.title)
      setExcerpt(a.excerpt ?? '')
    })
  }, [id])

  async function save(content: string) {
    setSaving(true)
    setMessage('')
    const res = await fetch(`/api/articles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, excerpt, content }),
    })
    if (res.ok) {
      setMessage('Saved.')
    } else {
      const d = await res.json()
      setMessage(d.error ?? 'Save failed')
    }
    setSaving(false)
  }

  if (!article) return <p className="text-[#5B665F]">Loading…</p>

  return (
    <div className="max-w-[760px]">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-xl font-bold text-[#15191C]">Edit article</h1>
        {message && <span className="text-sm text-green-600">{message}</span>}
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Excerpt</Label>
          <Input value={excerpt} onChange={e => setExcerpt(e.target.value)} />
        </div>
        {article.source_url && (
          <p className="text-xs text-[#5B665F]">
            Source: <a href={article.source_url} target="_blank" rel="noopener" className="text-[#0F6E52] hover:underline">{article.source_url}</a>
          </p>
        )}
      </div>

      <ArticleEditor
        initialContent={article.content}
        onPublish={save}
        loading={saving}
      />
    </div>
  )
}
