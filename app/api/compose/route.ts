import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getOpenAI } from '@/lib/openai'
import { DEFAULT_EXTRACTOR_PROMPT, DEFAULT_INDUSTRY_PROMPT, DEFAULT_THEORY_PROMPT } from '@/lib/prompts'

async function getPrompt(key: string, fallback: string): Promise<string> {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('settings').select('value').eq('key', key).single()
    return data?.value || fallback
  } catch {
    return fallback
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { stage, articleContent, sourceUrl, extraPrompt, contentType } = body

  const openai = getOpenAI()

  if (stage === 'extract') {
    const extractorPrompt = await getPrompt('prompt_extractor', DEFAULT_EXTRACTOR_PROMPT)
    const userContent = [
      sourceUrl ? `Source URL: ${sourceUrl}` : '',
      `Article content:\n${articleContent}`,
    ].filter(Boolean).join('\n\n')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: extractorPrompt },
        { role: 'user', content: userContent },
      ],
    })
    return NextResponse.json({ facts: completion.choices[0].message.content ?? '' })
  }

  if (stage === 'generate') {
    const { facts, title } = body
    const isTheory = contentType === 'theory'
    const basePrompt = isTheory
      ? await getPrompt('prompt_theory', DEFAULT_THEORY_PROMPT)
      : await getPrompt('prompt_industry', DEFAULT_INDUSTRY_PROMPT)

    const systemPrompt = extraPrompt
      ? `${basePrompt}\n\nADDITIONAL INSTRUCTIONS:\n${extraPrompt}`
      : basePrompt

    const userContent = [
      sourceUrl ? `Source URL: ${sourceUrl}` : '',
      title ? `Suggested title: ${title}` : '',
      `Extracted facts:\n${facts}`,
    ].filter(Boolean).join('\n\n')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
    })
    return NextResponse.json({ content: completion.choices[0].message.content ?? '' })
  }

  return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
}
