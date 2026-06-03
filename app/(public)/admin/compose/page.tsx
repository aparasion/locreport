'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArticleEditor } from '@/components/ArticleEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function ComposePage() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [content, setContent] = useState('')
  const [generating, setGenerating] = useState(false)
  const [publishing, setPublishing] = useState(false)

  async function generate() {
    if (!prompt.trim()) return
    setGenerating(true)
    const res = await fetch('/api/compose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })
    const data = await res.json()
    setContent(data.content ?? '')
    setGenerating(false)
  }

  async function publish(finalContent: string) {
    setPublishing(true)
    const res = await fetch('/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: finalContent }),
    })
    if (res.ok) router.push('/admin/drafts')
    setPublishing(false)
  }

  async function saveDraft(finalContent: string) {
    setPublishing(true)
    await fetch('/api/drafts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: finalContent }),
    })
    router.push('/admin/drafts')
  }

  return (
    <div className="max-w-[760px]">
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Compose</h1>

      {!content && (
        <div className="mb-6">
          <Label htmlFor="prompt">AI prompt</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            rows={4}
            placeholder="Write an article about the latest trends in neural machine translation..."
            className="mb-3"
          />
          <Button onClick={generate} disabled={generating}>
            {generating ? 'Generating…' : 'Generate article'}
          </Button>
        </div>
      )}

      {content && (
        <ArticleEditor
          initialContent={content}
          onPublish={publish}
          onSaveDraft={saveDraft}
          loading={publishing}
        />
      )}
    </div>
  )
}
