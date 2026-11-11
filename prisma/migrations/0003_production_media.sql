CREATE TABLE IF NOT EXISTS production_categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS production_videos (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  youtube_id CHAR(11) NOT NULL,
  thumbnail_url TEXT NOT NULL,
  duration TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  category_id UUID NOT NULL REFERENCES production_categories(id) ON DELETE RESTRICT,
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  published_at TIMESTAMPTZ,
  study_notes_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS production_videos_category_published_idx
  ON production_videos(category_id, published_at DESC);
CREATE INDEX IF NOT EXISTS production_videos_published_idx
  ON production_videos(published_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS production_videos_single_featured_idx
  ON production_videos(is_featured)
  WHERE is_featured = TRUE;
