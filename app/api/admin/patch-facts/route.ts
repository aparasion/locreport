import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// POST /api/admin/patch-facts
// Applies a curated list of content corrections to existing facts.
// Deletes facts that violate industry-relevance or subject rules with no salvageable fix.
// Updates facts whose content can be rephrased to meet current quality rules.
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const svc = createServiceClient()

  const DELETES: string[] = [
    'The FIFA World Cup 2026 will take place across 16 host cities in the United States, Canada, and Mexico, beginning in the summer of 2026.',
  ]

  const UPDATES: { from: string; to: string }[] = [
    {
      from: '40% of consumers will not purchase from websites presented in languages other than their own, underscoring the necessity for businesses to prioritize localized content.',
      to: 'CSA Research found that 40% of online consumers will not purchase from websites not presented in their own language, making native-language content a baseline requirement for international e-commerce.',
    },
    {
      from: '70% of consumers prefer to buy in their native language, highlighting the importance of effective localization strategies.',
      to: 'CSA Research data shows 72% of consumers spend most or all of their time on websites in their own language, and 72% are more likely to buy when product information is presented in their native tongue.',
    },
  ]

  const deleted: string[] = []
  const updated: string[] = []
  const notFound: string[] = []
  const errors: string[] = []

  for (const content of DELETES) {
    const { data, error } = await svc
      .from('facts')
      .delete()
      .eq('content', content)
      .select('id')
    if (error) {
      errors.push(`DELETE failed for "${content.slice(0, 60)}…": ${error.message}`)
    } else if (!data || data.length === 0) {
      notFound.push(content.slice(0, 80))
    } else {
      deleted.push(...data.map((r: { id: string }) => r.id))
    }
  }

  for (const { from, to } of UPDATES) {
    const { data, error } = await svc
      .from('facts')
      .update({ content: to })
      .eq('content', from)
      .select('id')
    if (error) {
      errors.push(`UPDATE failed for "${from.slice(0, 60)}…": ${error.message}`)
    } else if (!data || data.length === 0) {
      notFound.push(from.slice(0, 80))
    } else {
      updated.push(...data.map((r: { id: string }) => r.id))
    }
  }

  return NextResponse.json({
    ok: errors.length === 0,
    deleted: { count: deleted.length, ids: deleted },
    updated: { count: updated.length, ids: updated },
    not_found: notFound,
    errors,
  })
}
