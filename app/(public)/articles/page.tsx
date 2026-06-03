import { createClient } from '@/lib/supabase/server'
import { ArticleCard } from '@/components/ArticleCard'
import { Article } from '@/lib/types'

export const revalidate = 3600

const PAGE_SIZE = 30

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>
}) {
  const { page: pageStr, type } = await searchParams
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

  const { data: articles, count } = await query
  const total = count ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="max-w-[760px]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#111827]">All articles</h1>
        <div className="flex gap-2">
          {[
            { label: 'All', value: '' },
            { label: 'Industry', value: 'industry' },
            { label: 'Theory', value: 'theory' },
            { label: 'Reports', value: 'monthly-summary' },
          ].map(({ label, value }) => (
            <a
              key={value}
              href={value ? `/articles?type=${value}` : '/articles'}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                (type ?? '') === value
                  ? 'bg-[#3D5AFE] text-white'
                  : 'bg-[#EEF1F8] text-[#5A6278] hover:bg-[#E0E4F0]'
              }`}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {(articles as Article[])?.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <a href={`/articles?page=${page - 1}${type ? `&type=${type}` : ''}`}
              className="px-4 py-2 text-sm rounded-lg bg-[#EEF1F8] text-[#5A6278] hover:bg-[#E0E4F0]">
              Previous
            </a>
          )}
          <span className="px-4 py-2 text-sm text-[#5A6278]">Page {page} of {totalPages}</span>
          {page < totalPages && (
            <a href={`/articles?page=${page + 1}${type ? `&type=${type}` : ''}`}
              className="px-4 py-2 text-sm rounded-lg bg-[#EEF1F8] text-[#5A6278] hover:bg-[#E0E4F0]">
              Next
            </a>
          )}
        </div>
      )}
    </div>
  )
}
