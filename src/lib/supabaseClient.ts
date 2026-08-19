import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Format Supabase URL safely
const rawUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

let safeUrl = rawUrl;
if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
  safeUrl = `https://${rawUrl}.supabase.co`;
}

// Helper check to verify if valid Supabase credentials exist
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  supabaseAnonKey &&
  !safeUrl.includes("placeholder")
);

// Single centralized Supabase Client instance
export const supabase = createClient(safeUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/* SQL Blueprint Schema string for display in UI / SQL Editor */
export const SUPABASE_SQL_SCHEMA = `-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_pro BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Automatically create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Watchlist Table
CREATE TABLE public.watchlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id TEXT NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  rating NUMERIC,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, movie_id)
);

-- 3. Watch Progress & History Table
CREATE TABLE public.watch_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id TEXT NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  progress_seconds NUMERIC DEFAULT 0,
  duration_seconds NUMERIC DEFAULT 0,
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, movie_id)
);

-- 4. Download History Table
CREATE TABLE public.user_downloads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id TEXT NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  quality TEXT DEFAULT '1080p',
  file_size TEXT,
  download_url TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_downloads ENABLE ROW LEVEL SECURITY;

-- RLS Policies (User can read/write their own records only)
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users manage own watchlist" ON public.watchlists FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own watch history" ON public.watch_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own downloads" ON public.user_downloads FOR ALL USING (auth.uid() = user_id);
`;
