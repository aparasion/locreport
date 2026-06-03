import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { marked } from 'marked'
import { Article } from '@/lib/types'
import type { Metadata } from 'next'

export const revalidate = 86400

type Props = { params: Promise<{ slug: string[] }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('title, excerpt')
    .eq('slug', slug.join('/'))
    .single()
  if (!data) return {}
  return { title: `${data.title} — LocReport`, description: data.excerpt ?? undefined }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const articleSlug = slug.join('/')

  const supabase = await createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', articleSlug)
    .single()

  if (!article) notFound()

  const a = article as Article
  const html = marked.parse(a.content) as string
  const date = new Date(a.published_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <article className="max-w-[760px] mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-sm text-[#5A6278] mb-3">
          <span>{date}</span>
          {a.publisher && <><span>·</span><span>{a.publisher}</span></>}
          {a.author && <><span>·</span><span>{a.author}</span></>}
        </div>
        <h1 className="text-3xl font-bold text-[#111827] leading-tight mb-4">{a.title}</h1>
        {a.excerpt && <p className="text-lg text-[#5A6278]">{a.excerpt}</p>}
      </header>

      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

      {a.source_url && (
        <div className="mt-8 pt-6 border-t border-gray-100">
          <a
            href={a.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#3D5AFE] hover:underline"
          >
            View original source →
          </a>
        </div>
      )}

      {a.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {a.tags.map(tag => (
            <span key={tag} className="text-xs bg-[#EEF1F8] text-[#5A6278] px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
