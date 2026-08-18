import Link from 'next/link'
import { Article } from '@/lib/types'
import { articleHref, estimateReadMinutes, extractTeaser } from '@/lib/utils'
import { signalShortLabel } from '@/lib/intelligence'
import { SIGNAL_MAP } from '@/lib/signals'

const IMPACT_LABEL: Record<number, string> = { 1: 'Routine', 2: 'Notable', 3: 'Significant', 4: 'Major', 5: 'Disruptive' }
// Only the 'monthly-summary' type is worth flagging — 'industry' is the norm
// and labelling every row "Current news" is noise, not information.
const CATEGORY_LABEL: Record<string, string> = {
  'monthly-summary': 'Monthly report',
}

export function ArticleCard({ article, featured }: { article: Article; featured?: boolean }) {
  const date = new Date(article.published_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
  const readMinutes = estimateReadMinutes(article.content)
  const categoryLabel = article.article_type ? CATEGORY_LABEL[article.article_type] : undefined
  // One signal per row — the tag that says what the story is about, not a
  // full taxonomy dump.
  const signalId = (article.signal_ids ?? []).find(id => SIGNAL_MAP.has(id))

  return (
    <article className={`article-row${featured ? ' article-row--featured' : ''}`}>
      <div className="article-row__header">
        <span className="article-row__date">{date}<span className="read-time"> · {readMinutes} min read</span></span>
        {article.impact_score && article.impact_score >= 4 && (
          <span className="article-row__impact">
            <span className="article-row__impact-dot" aria-hidden="true" />
            {IMPACT_LABEL[article.impact_score]}
          </span>
        )}
        {categoryLabel && <span className="article-row__impact">{categoryLabel}</span>}
        {signalId && (
          <Link href={`/intelligence/signals/${signalId}`} className="article-row__signal">
            {signalShortLabel(signalId)}
          </Link>
        )}
      </div>
      <h2 className="article-row__title"><Link href={articleHref(article.slug)}>{article.title}</Link></h2>
      <p className="article-row__excerpt">{article.excerpt || extractTeaser(article.content)}</p>
      <div className="article-row__footer">
        {article.author && <span className="article-row__publisher">{article.author}</span>}
        <Link className="article-row__read-more" href={articleHref(article.slug)}>Read more →</Link>
      </div>
    </article>
  )
}
