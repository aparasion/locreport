import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { SITE_URL } from '@/lib/email/send'

async function unsubscribe(token: string | null): Promise<boolean> {
  if (!token || !/^[0-9a-f-]{36}$/i.test(token)) return false
  const supabase = createServiceClient()
  const { data: subscriber } = await supabase
    .from('subscribers')
    .select('id')
    .eq('manage_token', token)
    .maybeSingle()
  if (!subscriber) return false
  const { error } = await supabase
    .from('subscribers')
    .update({ status: 'unsubscribed', unsubscribed_at: new Date().toISOString() })
    .eq('id', subscriber.id)
  return !error
}

// One-click unsubscribe from the email footer link.
export async function GET(req: NextRequest) {
  const ok = await unsubscribe(req.nextUrl.searchParams.get('token'))
  const dest = ok ? '/subscribe/unsubscribed' : '/'
  return NextResponse.redirect(new URL(dest, SITE_URL))
}

// RFC 8058 List-Unsubscribe=One-Click target (mail clients POST here).
export async function POST(req: NextRequest) {
  const ok = await unsubscribe(req.nextUrl.searchParams.get('token'))
  return ok
    ? NextResponse.json({ ok: true })
    : NextResponse.json({ error: 'Invalid token' }, { status: 400 })
}
