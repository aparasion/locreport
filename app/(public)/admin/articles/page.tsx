import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Article } from '@/lib/types'
import { DeleteButton } from './DeleteButton'

export const dynamic = 'force-dynamic'

export default async function AdminArticlesPage() {
  const supabase = createServiceClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, published_at, article_type, publisher')
    .order('published_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Published Articles</h1>
      <div className="max-w-[760px]">
        {(articles as Partial<Article>[])?.map((a) => (
          <div
            key={a.id}
            className="py-4 flex items-start justify-between gap-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div>
              <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{a.title}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {a.published_at ? new Date(a.published_at).toLocaleDateString() : ''} · {a.publisher ?? '—'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href={`/admin/articles/${a.id}`}
                className="text-sm px-3 py-1 rounded-lg transition-colors"
                style={{ background: 'var(--bg-secondary)', color: 'var(--muted)', border: '1px solid var(--border)' }}
              >
                Edit
              </Link>
              <DeleteButton id={a.id!} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
