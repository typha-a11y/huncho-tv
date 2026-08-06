# Role
You are an expert Senior Web & PWA Frontend Engineer.
Write clean, simple, maintainable TypeScript and React code. Prioritize clarity over abstraction.

# Project Overview
We are building HunchOTV, a strictly light-theme, highly graphic, modern PWA for movie discovery and streaming.
Features:
- Light Bento-Grid dashboard (Hero featured banner, category carousels, instant debounced search)
- Metadata & Ratings mashup (TMDB API + OMDb API for IMDb/Rotten Tomatoes scores)
- Movie Details Modal (Synopsis, genre tags, cast details, ratings display)
- Custom HLS.js Light-Mode Video Player modal
- Supabase Auth & Cross-device "Continue Watching" sync
- PWA installability & offline asset caching

# Tech Stack
- React + Vite
- TypeScript
- Tailwind CSS
- Framer Motion
- Lucide React Icons
- HLS.js
- Supabase Client (@supabase/supabase-js)
- TanStack Query (@tanstack/react-query)
- Zustand (Global State)

# Development Philosophy
Build feature by feature using the 4-part prompt workflow (Anchor, Task, Constraints, Reference).
For every step:
1. Read this file first.
2. Build the smallest useful version first.
3. Keep changes tight, focused, and bug-free.
4. Prefer readable, maintainable code over unnecessary cleverness.

# Architecture & Directories
- src/components/ (Reusable UI blocks: MovieCard, BentoGrid, MovieModal, SearchOverlay, VideoPlayer)
- src/services/ (API integration helpers: tmdb.ts, omdb.ts, supabase.ts)
- src/store/ (Zustand stores: usePlayerStore.ts, useAuthStore.ts, useUIStore.ts)
- src/types/ (TypeScript interfaces for TMDB, OMDb, and User Watch History)
- src/hooks/ (Custom React Query and UI hooks)

# UI & Styling Rules
- STRICT LIGHT MODE ONLY: Backgrounds (`#F8F9FB`), surface cards (`#FFFFFF` with border `border-slate-200/60`), text (`#0F172A`).
- Accents: Electric Blue/Indigo (`#6366F1`) and Crimson (`#FF3366`).
- Encoding & Icons: Always use Lucide React icons (`<Star />`, `<Flame />`) instead of raw Unicode emoji string literals to avoid encoding artifacts (e.g., `â`).
- Legibility: Ensure readable gradient overlays (`from-white via-white/80 to-transparent` or high-contrast backdrop chips) on text sitting on top of hero images.
- Replicate designs with exact precision. Use backdrop-blur-md for floating glass panels.

# TypeScript Rules
- Strict mode. No `any` types. Clear, explicit interfaces for API structures and props.

# Secrets & Security
- Never expose private keys in client code. Use `VITE_` prefix for public client environment variables (`VITE_TMDB_API_KEY`, `VITE_OMDB_API_KEY`).