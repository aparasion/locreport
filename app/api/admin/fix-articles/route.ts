import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

// Known domain → publisher display name
const DOMAIN_PUBLISHER_MAP: Record<string, string> = {
  'slator.com': 'Slator',
  'multilingual.com': 'MultiLingual',
  'taus.net': 'TAUS',
  'gala-global.org': 'GALA',
  'nimdzi.com': 'Nimdzi',
  'localizationworld.com': 'LocWorld',
  'tcworld.info': 'tcworld',
  'translationdirectory.com': 'Translation Directory',
  'atanet.org': 'ATA',
  'proz.com': 'ProZ',
  'translatorscafe.com': 'TranslatorsCafe',
  'sdl.com': 'SDL',
  'rws.com': 'RWS',
  'welocalize.com': 'Welocalize',
  'lionbridge.com': 'Lionbridge',
  'transperfect.com': 'TransPerfect',
  'smartling.com': 'Smartling',
  'lokalise.com': 'Lokalise',
  'phrase.com': 'Phrase',
  'crowdin.com': 'Crowdin',
  'transifex.com': 'Transifex',
  'memoq.com': 'memoQ',
  'xtm.net': 'XTM',
  'wordbee.com': 'Wordbee',
  'memsource.com': 'Memsource',
  'plunet.com': 'Plunet',
  'xtrf.eu': 'XTRF',
  'googleusercontent.com': 'Google',
  'blog.google': 'Google Blog',
  'microsoft.com': 'Microsoft',
  'amazon.com': 'Amazon',
  'deepl.com': 'DeepL',
  'openai.com': 'OpenAI',
  'internationalsearchsummit.com': 'International Search Summit',
  'acolad.com': 'Acolad',
  'moravia.com': 'Moravia',
  'contentstrategy.com': 'Content Strategy',
  'csa-research.com': 'CSA Research',
  'common-sense-advisory.com': 'CSA Research',
}

const SLUGS_TO_FIX = [
  'enterprise-cms-localization-governance-workflow-and-risk-control-at-scale-mq554wuk',
  'should-you-build-or-buy-your-localization-infrastructure-mq552v16',
  'what-happens-when-ai-translates-for-an-audience-not-just-a-language-mq5502ba',
  'forcing-the-fit-mqm-in-the-age-of-automated-evaluation-mq1exsjs',
  'designing-ai-enabled-localization-workflows-for-enterprise-operations-mq1afbro',
  'every-market-is-a-new-market-mq1abdr4',
  'international-search-summit-new-york-mq12u088',
]

function publisherFromUrl(sourceUrl: string | null): string | null {
  if (!sourceUrl) return null
  try {
    const hostname = new URL(sourceUrl).hostname.replace(/^www\./, '')
    if (DOMAIN_PUBLISHER_MAP[hostname]) return DOMAIN_PUBLISHER_MAP[hostname]
    // Capitalize first segment of domain as fallback
    const parts = hostname.split('.')
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
  } catch {
    return null
  }
}

function cleanSlug(slug: string): string {
  // Remove the trailing random suffix: -[a-z0-9]{6,9}
  return slug.replace(/-[a-z0-9]{6,9}$/, '')
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()

  const { data: articles, error: fetchError } = await service
    .from('articles')
    .select('id, slug, source_url, publisher, title')
    .in('slug', SLUGS_TO_FIX)

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
  if (!articles?.length) return NextResponse.json({ message: 'No matching articles found', found: 0 })

  const results = []
  for (const article of articles) {
    const newSlug = cleanSlug(article.slug)
    const newPublisher = publisherFromUrl(article.source_url)

    // Check that clean slug isn't already taken by another article
    const { data: conflict } = await service
      .from('articles')
      .select('id')
      .eq('slug', newSlug)
      .neq('id', article.id)
      .maybeSingle()

    if (conflict) {
      results.push({ id: article.id, slug: article.slug, status: 'skipped', reason: `slug '${newSlug}' already taken` })
      continue
    }

    const updates: Record<string, string> = { slug: newSlug }
    if (newPublisher) updates.publisher = newPublisher

    const { error: updateError } = await service
      .from('articles')
      .update(updates)
      .eq('id', article.id)

    results.push({
      id: article.id,
      title: article.title,
      oldSlug: article.slug,
      newSlug,
      oldPublisher: article.publisher,
      newPublisher,
      sourceUrl: article.source_url,
      status: updateError ? 'error' : 'updated',
      error: updateError?.message,
    })
  }

  return NextResponse.json({ results, total: results.length })
}

// GET: dry-run — show what would change
export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const service = createServiceClient()

  const { data: articles, error: fetchError } = await service
    .from('articles')
    .select('id, slug, source_url, publisher, title')
    .in('slug', SLUGS_TO_FIX)

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  const preview = (articles ?? []).map(a => ({
    id: a.id,
    title: a.title,
    currentSlug: a.slug,
    newSlug: cleanSlug(a.slug),
    currentPublisher: a.publisher,
    newPublisher: publisherFromUrl(a.source_url),
    sourceUrl: a.source_url,
  }))

  return NextResponse.json({ dryRun: true, preview, found: preview.length })
}
