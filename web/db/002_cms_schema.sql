-- 002_cms_schema.sql
-- Adds the admin + CMS tables. The existing "messages" table is NOT changed.
-- Safe to run more than once (IF NOT EXISTS everywhere).

-- ============ ADMIN AUTHENTICATION ============

CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL UNIQUE CHECK (char_length(email) <= 254),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

-- Server-side sessions: the cookie holds a random token, we store only its hash.
-- Deleting a row logs that device out immediately.
CREATE TABLE IF NOT EXISTS admin_sessions (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS admin_sessions_expires_idx ON admin_sessions (expires_at);

-- Login attempts, used to slow down brute-force guessing
CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  succeeded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS login_attempts_ip_time_idx ON login_attempts (ip_hash, created_at DESC);

-- ============ MEDIA (metadata only, the files live in object storage) ============

CREATE TABLE IF NOT EXISTS media (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('image', 'logo', 'favicon', 'document')),
  storage_provider TEXT NOT NULL,
  storage_key TEXT NOT NULL,
  url TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes > 0),
  width INTEGER,
  height INTEGER,
  alt_text TEXT CHECK (char_length(alt_text) <= 200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ SITE SETTINGS, BRANDING, PROFILE ============

-- One row per setting: site title, description, SEO defaults, footer text,
-- nav labels, theme options, and which media rows are the active logo and favicon.
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY CHECK (char_length(key) <= 100),
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exactly one row (id is forced to 1)
CREATE TABLE IF NOT EXISTS profile (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  full_name TEXT NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT,
  bio TEXT,
  journey JSONB NOT NULL DEFAULT '[]',
  goals JSONB NOT NULL DEFAULT '[]',
  principles JSONB NOT NULL DEFAULT '[]',
  interests JSONB NOT NULL DEFAULT '[]',
  profile_media_id BIGINT REFERENCES media(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Email, phone, location, LinkedIn, GitHub, Telegram, and any future platform
CREATE TABLE IF NOT EXISTS contact_links (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('email', 'phone', 'location', 'social')),
  label TEXT NOT NULL CHECK (char_length(label) <= 50),
  value TEXT NOT NULL CHECK (char_length(value) <= 200),
  href TEXT CHECK (char_length(href) <= 500),
  visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skill_groups (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) <= 60),
  description TEXT CHECK (char_length(description) <= 200),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS skills (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id BIGINT NOT NULL REFERENCES skill_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) <= 60),
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS skills_group_idx ON skills (group_id, sort_order);

CREATE TABLE IF NOT EXISTS education (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  place TEXT NOT NULL,
  note TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS timeline_items (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ============ CV ============

CREATE TABLE IF NOT EXISTS cv_files (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title TEXT NOT NULL,
  version TEXT,
  media_id BIGINT NOT NULL REFERENCES media(id) ON DELETE RESTRICT,
  published BOOLEAN NOT NULL DEFAULT false,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Only one CV can be "current" at a time
CREATE UNIQUE INDEX IF NOT EXISTS cv_one_current_idx ON cv_files (is_current) WHERE is_current;

-- ============ CATEGORIES AND TAGS ============

CREATE TABLE IF NOT EXISTS categories (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  kind TEXT NOT NULL CHECK (kind IN ('project', 'post')),
  name TEXT NOT NULL CHECK (char_length(name) <= 60),
  slug TEXT NOT NULL CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  sort_order INTEGER NOT NULL DEFAULT 0,
  UNIQUE (kind, slug)
);

CREATE TABLE IF NOT EXISTS tags (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(name) <= 40),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

-- ============ PROJECTS ============

CREATE TABLE IF NOT EXISTS projects (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 150),
  short_description TEXT NOT NULL CHECK (char_length(short_description) <= 400),
  full_description TEXT,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  tech TEXT[] NOT NULL DEFAULT '{}',
  github_url TEXT CHECK (char_length(github_url) <= 500),
  live_url TEXT CHECK (char_length(live_url) <= 500),
  cover_media_id BIGINT REFERENCES media(id) ON DELETE SET NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS projects_public_idx ON projects (published, sort_order);

CREATE TABLE IF NOT EXISTS project_images (
  project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  media_id BIGINT NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, media_id)
);

-- ============ BLOG ============

CREATE TABLE IF NOT EXISTS posts (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 2 AND 200),
  excerpt TEXT NOT NULL CHECK (char_length(excerpt) <= 400),
  content TEXT NOT NULL,
  category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  cover_media_id BIGINT REFERENCES media(id) ON DELETE SET NULL,
  featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  seo_title TEXT CHECK (char_length(seo_title) <= 70),
  seo_description TEXT CHECK (char_length(seo_description) <= 200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS posts_public_idx ON posts (status, published_at DESC);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id BIGINT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);
CREATE INDEX IF NOT EXISTS post_tags_tag_idx ON post_tags (tag_id);