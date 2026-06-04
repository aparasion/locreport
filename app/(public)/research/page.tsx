import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import ResearchClient, { ResearchRow } from './ResearchClient'

export const metadata: Metadata = {
  title: 'Language Science — LocReport',
  description: 'Linguistic research papers and theoretical studies relevant to the language services industry — syntax, semantics, phonology, sociolinguistics, and more.',
}

export const revalidate = 3600

export default async function ResearchPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, publisher, relevance_score, research_domain, published_at')
    .eq('article_type', 'theory')
    .order('published_at', { ascending: false })

  const rows: ResearchRow[] = (data ?? []).map((a: any) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    publisher: a.publisher,
    relevance_score: a.relevance_score,
    research_domain: a.research_domain,
    published_at: a.published_at,
  }))

  return <ResearchClient articles={rows} />
}
