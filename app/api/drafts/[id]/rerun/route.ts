import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getOpenAI } from '@/lib/openai'
import { DEFAULT_EXTRACTOR_PROMPT, DEFAULT_INDUSTRY_PROMPT } from '@/lib/prompts'

type Params = { params: Promise<{ id: string }> }

async function getPrompt(key: string, fallback: string): Promise<string> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('settings').select('value').eq('key', key).single()
    return data?.value || fallback
  } catch {
    return fallback
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()

  const { data: draft, error: fetchError } = await service
    .from('drafts').select('*').eq('id', id).single()
  if (fetchError || !draft) {
    return NextResponse.json({ error: 'Draft not found' }, { status: 404 })
  }

  if (!draft.content) {
    return NextResponse.json({ error: 'Draft has no content to re-run' }, { status: 400 })
  }

  // Mark as rerunning
  await service.from('drafts').update({ status: 'rerunning' }).eq('id', id)

  try {
    const openai = getOpenAI()
    // Stage 1: extract facts
    const extractorPrompt = await getPrompt('prompt_extractor', DEFAULT_EXTRACTOR_PROMPT)
    const extractInput = [
      draft.source_url ? `Source URL: ${draft.source_url}` : '',
      `Article content:\n${draft.content}`,
    ].filter(Boolean).join('\n\n')

    const extractRes = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: extractorPrompt },
        { role: 'user', content: extractInput },
      ],
    })
    const facts = extractRes.choices[0].message.content ?? ''

    // Stage 2: generate article
    const basePrompt = await getPrompt('prompt_industry', DEFAULT_INDUSTRY_PROMPT)

    const generateInput = [
      draft.source_url ? `Source URL: ${draft.source_url}` : '',
      `Suggested title: ${draft.title}`,
      `Extracted facts:\n${facts}`,
    ].filter(Boolean).join('\n\n')

    const generateRes = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: basePrompt },
        { role: 'user', content: generateInput },
      ],
    })
    const newContent = generateRes.choices[0].message.content ?? ''

    const { data: updated, error: updateError } = await service
      .from('drafts')
      .update({ content: newContent, status: 'rerun' })
      .eq('id', id)
      .select()
      .single()

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    return NextResponse.json(updated)

  } catch (err) {
    await service.from('drafts').update({ status: 'pending' }).eq('id', id)
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Generation failed' }, { status: 500 })
  }
}
