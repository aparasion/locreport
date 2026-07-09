import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { SIGNAL_MAP } from '@/lib/signals'
import { articleHref } from '@/lib/utils'
import { digestEmail, DigestArticle, DigestSection } from '@/lib/email/templates'
import { digestFrom, getResend, SITE_URL } from '@/lib/email/send'

export const maxDuration = 300

const BATCH_SIZE = 100

interface DigestSourceArticle {
  id: string
  title: string
  slug: string
  excerpt: string | null
  impact_score: number | null
  signal_ids: string[] | null
  business_implications: string[] | null
  published_at: string
}

function toDigestArticle(a: DigestSourceArticle): DigestArticle {
  return {
    id: a.id,
    title: a.title,
    url: `${SITE_URL}${articleHref(a.slug)}`,
    excerpt: a.excerpt,
    impact_score: a.impact_score,
    business_implications: a.business_implications,
  }
}

// Compose Top Story + per-signal sections + a one-liner radar from a set of
// articles (already filtered to the subscriber's preferences).
function composeDigest(articles: DigestSourceArticle[]) {
  const byImpact = [...articles].sort(
    (a, b) => (b.impact_score ?? 0) - (a.impact_score ?? 0) || b.published_at.localeCompare(a.published_at)
  )
  const topStory = byImpact[0] ?? null
  const used = new Set<string>(topStory ? [topStory.id] : [])

  // Group remaining articles by signal, keep the 3 busiest signals
  const bySignal = new Map<string, DigestSourceArticle[]>()
  for (const a of byImpact) {
    if (used.has(a.id)) continue
    for (const sid of a.signal_ids ?? []) {
      if (!SIGNAL_MAP.has(sid)) continue
      if (!bySignal.has(sid)) bySignal.set(sid, [])
      bySignal.get(sid)!.push(a)
    }
  }

  const sections: DigestSection[] = []
  const topSignals = [...bySignal.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 3)
  for (const [sid, sigArticles] of topSignals) {
    const fresh = sigArticles.filter(a => !used.has(a.id)).slice(0, 3)
    if (fresh.length === 0) continue
    fresh.forEach(a => used.add(a.id))
    sections.push({
      heading: SIGNAL_MAP.get(sid)!.title,
      articles: fresh.map(toDigestArticle),
    })
  }

  const radar = byImpact.filter(a => !used.has(a.id)).slice(0, 6).map(toDigestArticle)
  return { topStory: topStory ? toDigestArticle(topStory) : null, sections, radar }
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  const isCron = auth === `Bearer ${process.env.CRON_SECRET}`

  if (!isCron) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const frequency = req.nextUrl.searchParams.get('frequency') === 'daily' ? 'daily' : 'weekly'
  const days = frequency === 'daily' ? 1 : 7
  const periodEnd = new Date()
  const periodStart = new Date(periodEnd.getTime() - days * 24 * 60 * 60 * 1000)

  const service = createServiceClient()

  const { data: articles, error: articlesError } = await service
    .from('articles')
    .select('id, title, slug, excerpt, impact_score, signal_ids, business_implications, published_at')
    .eq('article_type', 'industry')
    .gte('published_at', periodStart.toISOString())
    .order('published_at', { ascending: false })

  if (articlesError) return NextResponse.json({ error: articlesError.message }, { status: 500 })
  if (!articles || articles.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, skipped: 0, reason: 'no articles in period' })
  }

  const { data: subscribers, error: subsError } = await service
    .from('subscribers')
    .select('id, email, signal_prefs, min_impact, manage_token, last_sent_at')
    .eq('status', 'active')
    .eq('frequency', frequency)

  if (subsError) return NextResponse.json({ error: subsError.message }, { status: 500 })

  const periodLabel = frequency === 'daily'
    ? periodEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : `Week of ${periodStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`

  type Payload = {
    from: string
    to: string
    subject: string
    html: string
    headers: Record<string, string>
    subscriberId: string
    articleIds: string[]
  }
  const payloads: Payload[] = []
  let skipped = 0

  for (const sub of subscribers ?? []) {
    // Idempotency: safe to re-run — anyone already covered this period is skipped
    if (sub.last_sent_at && new Date(sub.last_sent_at) > periodStart) {
      skipped++
      continue
    }

    const prefs: string[] = sub.signal_prefs ?? []
    const matched = (articles as DigestSourceArticle[]).filter(a => {
      if ((a.impact_score ?? 0) < (sub.min_impact ?? 1)) return false
      if (prefs.length === 0) return true
      return (a.signal_ids ?? []).some(sid => prefs.includes(sid))
    })
    if (matched.length === 0) {
      skipped++
      continue
    }

    const { topStory, sections, radar } = composeDigest(matched)
    const manageUrl = `${SITE_URL}/subscribe/manage?token=${sub.manage_token}`
    const unsubscribeUrl = `${SITE_URL}/api/subscribe/unsubscribe?token=${sub.manage_token}`

    payloads.push({
      from: digestFrom(),
      to: sub.email,
      subject: topStory
        ? `LocReport digest: ${topStory.title}`
        : `Your LocReport ${frequency} digest`,
      html: digestEmail({ periodLabel, topStory, sections, radar, manageUrl, unsubscribeUrl }),
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      subscriberId: sub.id,
      articleIds: matched.map(a => a.id),
    })
  }

  const resend = getResend()
  let sent = 0
  const errors: string[] = []

  for (let i = 0; i < payloads.length; i += BATCH_SIZE) {
    const batch = payloads.slice(i, i + BATCH_SIZE)
    const { data, error } = await resend.batch.send(
      batch.map(({ from, to, subject, html, headers }) => ({ from, to, subject, html, headers }))
    )
    if (error) {
      errors.push(error.message)
      continue
    }
    const now = new Date().toISOString()
    for (let j = 0; j < batch.length; j++) {
      const p = batch[j]
      sent++
      await service.from('digest_sends').insert({
        subscriber_id: p.subscriberId,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        article_ids: p.articleIds,
        resend_id: data?.data?.[j]?.id ?? null,
      })
      await service.from('subscribers').update({ last_sent_at: now }).eq('id', p.subscriberId)
    }
  }

  return NextResponse.json({ ok: true, frequency, sent, skipped, articles: articles.length, errors })
}
