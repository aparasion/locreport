import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getOpenAI } from '@/lib/openai'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { prompt } = await req.json()
  const openai = getOpenAI()
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a journalist for LocReport covering the language services industry. Write a polished article in Markdown starting with # Title, followed by well-structured paragraphs with ## subheadings.',
      },
      { role: 'user', content: prompt },
    ],
  })
  return NextResponse.json({ content: completion.choices[0].message.content ?? '' })
}
