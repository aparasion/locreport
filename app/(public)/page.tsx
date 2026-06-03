import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ArticleCard } from '@/components/ArticleCard'
import { Article } from '@/lib/types'

export const revalidate = 3600

export default async function HomePage() {
  const supabase = await createClient()

  // Group articles by day (up to 3 days, ~30 articles)
  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(30)

  // Group by date string
  const byDay = new Map<string, Article[]>()
  for (const a of (articles as Article[]) ?? []) {
    const day = new Date(a.published_at).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
    if (!byDay.has(day)) byDay.set(day, [])
    byDay.get(day)!.push(a)
    if (byDay.size >= 3 && byDay.get(day)!.length === 1) break
  }

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span>●</span>
          Language services intelligence
        </div>
        <h1>The pulse of the language services industry</h1>
        <p className="hero-subtitle">
          Daily translation and localization news capturing the trends, innovations,
          and movements shaping global communication.
        </p>
        <div className="hero-actions">
          <Link href="/articles" className="btn btn--primary">Browse articles</Link>
          <Link href="/articles?type=theory" className="btn btn--teal">Language science</Link>
        </div>
      </section>

      {/* Articles by day */}
      <div className="max-w-[760px]">
        {[...byDay.entries()].map(([day, dayArticles]) => (
          <div key={day}>
            <div className="day-header">{day}</div>
            {dayArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ))}
        <div className="mt-8">
          <Link href="/articles" className="btn btn--primary">View all articles →</Link>
        </div>
      </div>
    </>
  )
}
