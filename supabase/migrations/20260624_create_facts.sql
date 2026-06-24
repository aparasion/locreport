CREATE TABLE IF NOT EXISTS facts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  category text NOT NULL DEFAULT 'entity',
  source_url text,
  source_name text,
  draft_id uuid REFERENCES drafts(id) ON DELETE SET NULL,
  article_id uuid REFERENCES articles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS facts_created_at_idx ON facts(created_at DESC);
CREATE INDEX IF NOT EXISTS facts_draft_id_idx ON facts(draft_id);
CREATE INDEX IF NOT EXISTS facts_article_id_idx ON facts(article_id);
