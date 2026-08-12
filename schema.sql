-- ====================================================================
-- Huncho TV Streaming UI & Multi-Server Links Schema
-- Target Database: PostgreSQL / Supabase
-- ====================================================================

-- 1. Enable pgcrypto extension for UUID generation if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create stream_servers table
CREATE TABLE IF NOT EXISTS public.stream_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id TEXT NOT NULL,
  title TEXT,
  server_key TEXT NOT NULL,
  server_name TEXT NOT NULL,
  stream_url TEXT NOT NULL,
  stream_type TEXT NOT NULL CHECK (stream_type IN ('embed', 'direct_hls', 'direct_mp4')),
  quality TEXT DEFAULT '1080p HD',
  latency_ms INTEGER DEFAULT 250,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_movie_server UNIQUE (movie_id, server_key)
);

-- 3. Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_stream_servers_movie_id ON public.stream_servers(movie_id);
CREATE INDEX IF NOT EXISTS idx_stream_servers_latency_ms ON public.stream_servers(latency_ms);
CREATE INDEX IF NOT EXISTS idx_stream_servers_is_active ON public.stream_servers(is_active);

-- 4. Create Automatic updated_at Trigger
CREATE OR REPLACE FUNCTION update_stream_servers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_stream_servers_updated_at ON public.stream_servers;
CREATE TRIGGER trg_stream_servers_updated_at
  BEFORE UPDATE ON public.stream_servers
  FOR EACH ROW
  EXECUTE FUNCTION update_stream_servers_updated_at();

-- 5. Row Level Security (RLS) Setup
ALTER TABLE public.stream_servers ENABLE ROW LEVEL SECURITY;

-- RLS Policy 1: Public Read Access for active streaming servers
DROP POLICY IF EXISTS "Allow public read access to active stream servers" ON public.stream_servers;
CREATE POLICY "Allow public read access to active stream servers"
  ON public.stream_servers
  FOR SELECT
  TO public
  USING (is_active = TRUE);

-- RLS Policy 2: Restrict Inserts, Updates, Deletions to Service Role only
DROP POLICY IF EXISTS "Allow service role full access to stream servers" ON public.stream_servers;
CREATE POLICY "Allow service role full access to stream servers"
  ON public.stream_servers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 6. Sample Seed Data for testing & demonstration
INSERT INTO public.stream_servers (
  movie_id,
  title,
  server_key,
  server_name,
  stream_url,
  stream_type,
  quality,
  latency_ms,
  is_active
)
VALUES
  ('tt30851137', 'Dune: Part Two', 'dulo', 'Dulo Stream VIP', 'https://vidsrc.me/embed/movie?imdb=tt30851137', 'embed', '1080p HD', 180, true),
  ('tt30851137', 'Dune: Part Two', 'flixhq', 'FlixHQ Pro', 'https://vidsrc.to/embed/movie/tt30851137', 'embed', '1080p Ultra', 240, true),
  ('tt30851137', 'Dune: Part Two', 'vidsrc', 'VidSrc Fast', 'https://vidsrc.xyz/embed/movie?imdb=tt30851137', 'embed', '1080p HD', 310, true),
  ('tt30851137', 'Dune: Part Two', 'gomovies', 'GoMovies Standard', 'https://2embed.cc/embed/tt30851137', 'embed', '720p HD', 650, true)
ON CONFLICT (movie_id, server_key) DO UPDATE SET
  title = EXCLUDED.title,
  server_name = EXCLUDED.server_name,
  stream_url = EXCLUDED.stream_url,
  stream_type = EXCLUDED.stream_type,
  quality = EXCLUDED.quality,
  latency_ms = EXCLUDED.latency_ms,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
