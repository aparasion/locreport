-- Semantic + full-text hybrid search infrastructure.
-- Requires the pgvector extension (available on all Supabase projects).

create extension if not exists vector;

alter table articles add column if not exists embedding vector(1536);

alter table articles add column if not exists fts tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(left(content, 20000), '')), 'C')
  ) stored;

create index if not exists articles_embedding_hnsw
  on articles using hnsw (embedding vector_cosine_ops);

create index if not exists articles_fts_gin
  on articles using gin (fts);

-- Hybrid search: Reciprocal Rank Fusion of the semantic (vector) and
-- keyword (tsvector) rankings. RRF needs no score normalization between
-- the two legs and degrades gracefully when either leg returns nothing.
create or replace function hybrid_search_articles(
  query_text text,
  query_embedding vector(1536),
  match_count int default 20,
  rrf_k int default 50
) returns table (
  id uuid,
  title text,
  slug text,
  excerpt text,
  publisher text,
  author text,
  article_type text,
  published_at timestamptz,
  impact_score int,
  signal_ids text[],
  score float
)
language sql stable as $$
  with semantic as (
    select a.id, row_number() over (order by a.embedding <=> query_embedding) as rank
    from articles a
    where a.embedding is not null
    order by a.embedding <=> query_embedding
    limit 60
  ),
  keyword as (
    select a.id,
           row_number() over (
             order by ts_rank_cd(a.fts, websearch_to_tsquery('english', query_text)) desc
           ) as rank
    from articles a
    where a.fts @@ websearch_to_tsquery('english', query_text)
    limit 60
  )
  select a.id, a.title, a.slug, a.excerpt, a.publisher, a.author, a.article_type,
         a.published_at, a.impact_score, a.signal_ids,
         coalesce(1.0 / (rrf_k + s.rank), 0) + coalesce(1.0 / (rrf_k + k.rank), 0) as score
  from semantic s
  full outer join keyword k using (id)
  join articles a on a.id = coalesce(s.id, k.id)
  order by score desc
  limit match_count;
$$;

-- Keyword-only fallback used when the query embedding is unavailable
-- (e.g. OpenAI outage). Same shape as hybrid_search_articles.
create or replace function keyword_search_articles(
  query_text text,
  match_count int default 20
) returns table (
  id uuid,
  title text,
  slug text,
  excerpt text,
  publisher text,
  author text,
  article_type text,
  published_at timestamptz,
  impact_score int,
  signal_ids text[],
  score float
)
language sql stable as $$
  select a.id, a.title, a.slug, a.excerpt, a.publisher, a.author, a.article_type,
         a.published_at, a.impact_score, a.signal_ids,
         ts_rank_cd(a.fts, websearch_to_tsquery('english', query_text))::float as score
  from articles a
  where a.fts @@ websearch_to_tsquery('english', query_text)
  order by score desc
  limit match_count;
$$;

-- Nearest-neighbor lookup for "related articles" on article pages.
create or replace function match_articles(
  query_embedding vector(1536),
  match_count int default 6,
  exclude_id uuid default null
) returns table (
  id uuid,
  title text,
  slug text,
  excerpt text,
  published_at timestamptz,
  impact_score int,
  similarity float
)
language sql stable as $$
  select a.id, a.title, a.slug, a.excerpt, a.published_at, a.impact_score,
         1 - (a.embedding <=> query_embedding) as similarity
  from articles a
  where a.embedding is not null
    and (exclude_id is null or a.id <> exclude_id)
  order by a.embedding <=> query_embedding
  limit match_count;
$$;
