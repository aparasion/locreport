import Link from 'next/link'
import { Article } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

export function ArticleCard({ article }: { article: Article }) {
  const date = new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <article className="border-b border-gray-100 py-6 last:border-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-[#5A6278]">{date}</span>
        {article.publisher && (
          <span className="text-xs text-[#5A6278]">· {article.publisher}</span>
        )}
        {article.article_type !== 'industry' && (
          <Badge variant="muted">{article.article_type}</Badge>
        )}
        {article.impact_score && article.impact_score >= 4 && (
          <Badge variant="default">High impact</Badge>
        )}
      </div>
      <h2 className="text-lg font-semibold text-[#111827] mb-2 leading-snug">
        <Link href={`/articles/${article.slug}`} className="hover:text-[#3D5AFE] transition-colors">
          {article.title}
        </Link>
      </h2>
      {article.excerpt && (
        <p className="text-sm text-[#5A6278] line-clamp-2">{article.excerpt}</p>
      )}
      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {article.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="text-xs text-[#5A6278] bg-[#EEF1F8] px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
