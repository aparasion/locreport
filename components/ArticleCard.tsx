import Link from 'next/link'
import { Article } from '@/lib/types'

export function ArticleCard({ article }: { article: Article }) {
  const date = new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <article className="post-card">
      <div className="post-card__meta-row">
        {article.publisher && (
          <span className="post-card__publisher">{article.publisher}</span>
        )}
        <span className="post-card__date">{date}</span>
        {article.article_type !== 'industry' && (
          <span className="post-card__publisher" style={{ background: 'rgba(26,122,138,0.1)', color: '#1A7A8A', borderColor: 'rgba(26,122,138,0.2)' }}>
            {article.article_type}
          </span>
        )}
      </div>
      <h2 className="post-card__title">
        <Link href={`/articles/${article.slug}`}>{article.title}</Link>
      </h2>
      {article.excerpt && (
        <p className="post-card__excerpt">{article.excerpt}</p>
      )}
      {article.tags?.length > 0 && (
        <div className="post-card__tags">
          {article.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="post-card__tag">{tag}</span>
          ))}
        </div>
      )}
    </article>
  )
}
