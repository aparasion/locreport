import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArticleCard } from '@/components/ArticleCard'
import { Article } from '@/lib/types'

export const revalidate = 3600

export default async function HomePage() {
  const supabase = await createClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(10)

  return (
    <>
      {/* Hero */}
      <section className="mb-12 py-12 text-center">
        <h1 className="text-4xl font-bold text-[#111827] mb-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
          The pulse of the language services industry
        </h1>
        <p className="text-lg text-[#5A6278] max-w-2xl mx-auto">
          Daily translation and localization news capturing the trends, innovations,
          and movements shaping global communication.
        </p>
        <Link
          href="/articles"
          className="mt-6 inline-block bg-[#3D5AFE] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#3049E6] transition-colors"
        >
          Browse all articles
        </Link>
      </section>

      {/* Recent articles */}
      <section>
        <h2 className="text-xl font-semibold text-[#111827] mb-6">Recent articles</h2>
        <div className="max-w-[760px]">
          {(articles as Article[])?.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </>
  )
}
