import { createServiceClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Article } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminArticlesPage() {
  const supabase = createServiceClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, published_at, article_type, publisher')
    .order('published_at', { ascending: false })

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Published Articles</h1>
      <div className="max-w-[760px]">
        {(articles as Partial<Article>[])?.map((a) => (
          <div key={a.id} className="border-b border-gray-100 py-4 flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-[#111827] text-sm">{a.title}</p>
              <p className="text-xs text-[#5A6278] mt-0.5">
                {a.published_at ? new Date(a.published_at).toLocaleDateString() : ''} · {a.publisher ?? '—'}
              </p>
            </div>
            <Link
              href={`/admin/articles/${a.id}`}
              className="text-sm shrink-0 px-3 py-1 rounded-lg bg-[#EEF1F8] text-[#5A6278] hover:bg-[#E0E4F0]"
            >
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
