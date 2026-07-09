import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { SIGNAL_MAP } from '@/lib/signals'

// Token-authenticated preference updates from the manage page.
export async function POST(req: NextRequest) {
  let body: {
    token?: string
    signal_prefs?: string[]
    min_impact?: number
    frequency?: string
    unsubscribe?: boolean
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const token = body.token ?? ''
  if (!/^[0-9a-f-]{36}$/i.test(token)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id, status')
    .eq('manage_token', token)
    .maybeSingle()

  if (!subscriber) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  if (body.unsubscribe) {
    const { error } = await supabase
      .from('subscribers')
      .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
      .eq('id', subscriber.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, unsubscribed: true })
  }

  const patch: Record<string, unknown> = {}
  if (Array.isArray(body.signal_prefs)) {
    patch.signal_prefs = body.signal_prefs.filter(id => SIGNAL_MAP.has(id))
  }
  if (typeof body.min_impact === 'number' && body.min_impact >= 1 && body.min_impact <= 5) {
    patch.min_impact = Math.round(body.min_impact)
  }
  if (body.frequency === 'weekly' || body.frequency === 'daily') {
    patch.frequency = body.frequency
  }
  // Saving preferences from the manage link re-activates an unsubscribed address
  if (subscriber.status === 'unsubscribed') {
    patch.status = 'active'
    patch.unsubscribed_at = null
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { error } = await supabase.from('subscribers').update(patch).eq('id', subscriber.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
