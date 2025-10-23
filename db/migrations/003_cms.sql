-- CMS tables for articles, banners, themes

CREATE TABLE IF NOT EXISTS cms_articles (
  id TEXT PRIMARY KEY DEFAULT CONCAT('ART', EXTRACT(EPOCH FROM now())::bigint::text),
  title TEXT NOT NULL,
  body TEXT,
  section TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft','review','approved','published')),
  schedule_start TIMESTAMPTZ NULL,
  schedule_end TIMESTAMPTZ NULL,
  published_at TIMESTAMPTZ NULL,
  author_id TEXT NULL,
  audit JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_cms_articles_visibility
  ON cms_articles (status, schedule_start, schedule_end, published_at);

CREATE TABLE IF NOT EXISTS cms_banners (
  id TEXT PRIMARY KEY DEFAULT CONCAT('BAN', EXTRACT(EPOCH FROM now())::bigint::text),
  title TEXT NOT NULL,
  media_url TEXT NOT NULL,
  link_url TEXT NULL,
  position TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('draft','published')),
  schedule_start TIMESTAMPTZ NULL,
  schedule_end TIMESTAMPTZ NULL,
  published_at TIMESTAMPTZ NULL,
  audit JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_cms_banners_visibility
  ON cms_banners (status, schedule_start, schedule_end, published_at, sort_order);

CREATE TABLE IF NOT EXISTS cms_themes (
  id TEXT PRIMARY KEY DEFAULT CONCAT('THE', EXTRACT(EPOCH FROM now())::bigint::text),
  name TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb
);

