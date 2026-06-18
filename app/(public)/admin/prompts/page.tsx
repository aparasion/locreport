'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { DEFAULT_EXTRACTOR_PROMPT, DEFAULT_INDUSTRY_PROMPT, DEFAULT_MONTHLY_PROMPT } from '@/lib/prompts'

type PromptKey = 'prompt_extractor' | 'prompt_industry' | 'prompt_monthly'

const PROMPTS: { key: PromptKey; label: string; default: string }[] = [
  { key: 'prompt_extractor', label: 'Stage 1 — Extractor (fact extraction)', default: DEFAULT_EXTRACTOR_PROMPT },
  { key: 'prompt_industry', label: 'Stage 2 — Industry editorial (LocReport voice)', default: DEFAULT_INDUSTRY_PROMPT },
  { key: 'prompt_monthly', label: 'Monthly report (2000-word synthesis)', default: DEFAULT_MONTHLY_PROMPT },
]

export default function PromptsPage() {
  const [values, setValues] = useState<Record<PromptKey, string>>({
    prompt_extractor: '',
    prompt_industry: '',
    prompt_monthly: '',
  })
  const [saving, setSaving] = useState<PromptKey | null>(null)
  const [saved, setSaved] = useState<PromptKey | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(({ settings }) => {
        setValues(v => ({
          prompt_extractor: settings.prompt_extractor || DEFAULT_EXTRACTOR_PROMPT,
          prompt_industry: settings.prompt_industry || DEFAULT_INDUSTRY_PROMPT,
          prompt_monthly: settings.prompt_monthly || DEFAULT_MONTHLY_PROMPT,
        }))
        setLoading(false)
      })
  }, [])

  async function save(key: PromptKey) {
    setSaving(key)
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: values[key] }),
    })
    setSaving(null)
    setSaved(key)
    setTimeout(() => setSaved(null), 2000)
  }

  function reset(key: PromptKey, defaultVal: string) {
    setValues(v => ({ ...v, [key]: defaultVal }))
  }

  if (loading) return <div className="text-sm" style={{ color: 'var(--muted)' }}>Loading prompts…</div>

  return (
    <div className="max-w-[860px]">
      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Prompt Editor</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--muted)' }}>Edit the AI prompts used during article generation. Changes take effect immediately for all new articles.</p>

      <div className="flex flex-col gap-10">
        {PROMPTS.map(({ key, label, default: defaultVal }) => (
          <div key={key}>
            <Label className="text-base font-semibold mb-1 block" style={{ color: 'var(--text)' }}>{label}</Label>
            {key === 'prompt_monthly' && (
              <p className="text-xs mb-2" style={{ color: 'var(--muted)' }}>Used by the Next.js monthly report generator. The Jekyll GitHub Actions script has its own copy — update both if you change the structure.</p>
            )}
            <Textarea
              value={values[key]}
              onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
              rows={18}
              className="font-mono text-xs mb-2"
            />
            <div className="flex gap-2">
              <Button onClick={() => save(key)} disabled={saving === key}>
                {saving === key ? 'Saving…' : saved === key ? 'Saved ✓' : 'Save'}
              </Button>
              <Button variant="secondary" onClick={() => reset(key, defaultVal)}>Reset to default</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
