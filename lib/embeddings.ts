import type { SupabaseClient } from '@supabase/supabase-js'
import { getOpenAI } from '@/lib/openai'

// Single embedding model reference — do not hardcode elsewhere
// (mirrors the lib/openai.ts convention for chat models).
export const EMBEDDING_MODEL = 'text-embedding-3-small'
export const EMBEDDING_DIMENSIONS = 1536

// ~8k tokens of input is plenty for article-level semantics and stays
// far under the model's context limit.
const MAX_INPUT_CHARS = 24000

export function embeddingInput(article: { title: string; excerpt?: string | null; content?: string | null }): string {
  return [article.title, article.excerpt ?? '', article.content ?? '']
    .join('\n\n')
    .slice(0, MAX_INPUT_CHARS)
}

export async function embedText(text: string): Promise<number[]> {
  const openai = getOpenAI()
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, MAX_INPUT_CHARS),
  })
  return res.data[0].embedding
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  const openai = getOpenAI()
  const res = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: texts.map(t => t.slice(0, MAX_INPUT_CHARS)),
  })
  return res.data.map(d => d.embedding)
}

/**
 * Embed a published article and persist the vector. Failures are logged,
 * never thrown — an embedding hiccup must not block publishing. The
 * backfill route picks up any article left with a null embedding.
 */
export async function embedAndStoreArticle(
  supabase: SupabaseClient,
  articleId: string
): Promise<void> {
  try {
    const { data: article, error } = await supabase
      .from('articles')
      .select('id, title, excerpt, content')
      .eq('id', articleId)
      .single()
    if (error || !article) {
      console.error(`embedAndStoreArticle: article ${articleId} not found`, error)
      return
    }
    const embedding = await embedText(embeddingInput(article))
    const { error: updateError } = await supabase
      .from('articles')
      .update({ embedding })
      .eq('id', articleId)
    if (updateError) console.error(`embedAndStoreArticle: update failed for ${articleId}`, updateError)
  } catch (err) {
    console.error(`embedAndStoreArticle: failed for ${articleId}`, err)
  }
}
