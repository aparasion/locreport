ALTER TABLE facts ADD COLUMN IF NOT EXISTS tweeted_at timestamptz;
ALTER TABLE facts ADD COLUMN IF NOT EXISTS tweet_id text;

CREATE INDEX IF NOT EXISTS facts_tweeted_at_idx ON facts (tweeted_at) WHERE tweeted_at IS NULL;
