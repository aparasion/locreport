import { createClient } from '@/lib/supabase/server'
import { ArticleCard } from '@/components/ArticleCard'
import { Article } from '@/lib/types'
import Link from 'next/link'

export const revalidate = 3600

const PAGE_SIZE = 30

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string; q?: string }>
}) {
  const { page: pageStr, type, q } = await searchParams
  const page = Math.max(1, parseInt(pageStr ?? '1'))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const supabase = await createClient()
  let query = supabase
    .from('articles')
    .select('*', { count: 'exact' })
    .order('published_at', { ascending: false })
    .range(from, to)

  if (type) query = query.eq('article_type', type)
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: articles, count } = await query
  const total = count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  const filters = [
    { label: 'All', value: '' },
    { label: 'Industry', value: 'industry' },
    { label: 'Theory', value: 'theory' },
    { label: 'Reports', value: 'monthly-summary' },
  ]

  return (
    <div className="container" style={{ paddingTop: 'var(--space-8)', paddingBottom: 'var(--space-12)' }}>
      <div className="articles-section">
        <div className="articles-section-header" style={{ marginBottom: 'var(--space-5)' }}>
          <h1 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', margin: 0 }}>
            {type ? filters.find(f => f.value === type)?.label : 'All'} articles
            {total > 0 && <span style={{ fontWeight: 400 }}> · {total.toLocaleString()}</span>}
          </h1>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {filters.map(({ label, value }) => (
              <Link
                key={value}
                href={value ? `/articles?type=${value}` : '/articles'}
                className="topic-pill"
                style={((type ?? '') === value) ? { background: 'var(--accent)', color: '#fff', borderColor: 'var(--accent)' } : undefined}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="article-list" style={{ maxWidth: 'var(--content-width)' }}>
          {(articles as Article[])?.map((article, i) => (
            <ArticleCard key={article.id} article={article} featured={i === 0 && page === 1 && !type && !q} />
          ))}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: 'var(--space-8)' }}>
            {page > 1 && (
              <Link href={`/articles?page=${page - 1}${type ? `&type=${type}` : ''}`} className="btn btn--secondary">
                ← Previous
              </Link>
            )}
            <span style={{ padding: '10px 16px', fontSize: '0.85rem', color: 'var(--muted)' }}>
              Page {page} of {totalPages}
            </span>
            {page < totalPages && (
              <Link href={`/articles?page=${page + 1}${type ? `&type=${type}` : ''}`} className="btn btn--secondary">
                Next →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
