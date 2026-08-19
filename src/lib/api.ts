import axios from "axios";
import { Movie, MovieDetails, Ratings, OMDbResponse, DownloadSource, DownloadResolverResult } from "../types";
import { supabase } from "./supabaseClient";
import { getSafeImageUrl, cleanTitleForTMDB } from "./imageUtils";
import { env } from "./env";

const TMDB_API_KEY = env.VITE_TMDB_API_KEY;
const OMDB_API_KEY = env.VITE_OMDB_API_KEY;

export const isTmdbConfigured = Boolean(TMDB_API_KEY);

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const getImageUrl = (path: string | null, size: "w500" | "original" = "w500") => {
  return getSafeImageUrl(path);
};

const fallbackCache = new Map<string, string>();

export const fetchTmdbPosterFallback = async (title: string): Promise<string | null> => {
  if (!title || !TMDB_API_KEY) return null;
  const cleanTitle = cleanTitleForTMDB(title);
  if (!cleanTitle) return null;

  if (fallbackCache.has(cleanTitle)) {
    const cached = fallbackCache.get(cleanTitle);
    return cached || null;
  }

  try {
    let results: any[] = [];
    try {
      const res = await tmdb.get("/search/multi", { params: { query: cleanTitle } });
      results = res.data?.results || [];
    } catch (e) {
      // Fallback to direct fetch if axios instance fails
    }

    if (results.length === 0 && TMDB_API_KEY) {
      const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}`;
      const res = await axios.get(url, { timeout: 4000 });
      results = res.data?.results || [];
    }

    const match = results.find((item: any) => item.poster_path || item.backdrop_path);
    if (match) {
      const imgPath = match.poster_path || match.backdrop_path;
      if (imgPath) {
        const fullUrl = `https://image.tmdb.org/t/p/w500${imgPath}`;
        fallbackCache.set(cleanTitle, fullUrl);
        return fullUrl;
      }
    }

    // Secondary fallback: search movie endpoint directly
    if (TMDB_API_KEY) {
      const movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(cleanTitle)}`;
      const movieRes = await axios.get(movieUrl, { timeout: 4000 });
      const movieResults = movieRes.data?.results || [];
      const movieMatch = movieResults.find((item: any) => item.poster_path || item.backdrop_path);
      if (movieMatch) {
        const imgPath = movieMatch.poster_path || movieMatch.backdrop_path;
        if (imgPath) {
          const fullUrl = `https://image.tmdb.org/t/p/w500${imgPath}`;
          fallbackCache.set(cleanTitle, fullUrl);
          return fullUrl;
        }
      }
    }
  } catch (err) {
    console.warn("TMDB API fallback poster fetch error:", err);
  }

  fallbackCache.set(cleanTitle, "");
  return null;
};

// Fallback mock data if TMDB key is missing
const mockMovies: Movie[] = Array.from({ length: 10 }).map((_, i) => ({
  id: 1000 + i,
  title: `Trending Movie ${i + 1}`,
  original_title: `Trending Movie ${i + 1}`,
  overview: "A fascinating story about something extraordinary. The hero goes on an adventure to save the world.",
  poster_path: null,
  backdrop_path: null,
  release_date: "2024-01-01",
  vote_average: 8.5 - i * 0.1,
  vote_count: 1000 + i * 100,
  genre_ids: [28, 12],
  media_type: "movie",
}));

export const getCuratedDownloads = async (): Promise<Movie[]> => {
  try {
    const { data: movies, error } = await supabase
      .from('movies')
      .select('id, imdb_id, title, uploader_name')
      .limit(10);
      
    if (error || !movies) {
      console.warn("Supabase Custom Downloads fetch error:", error);
      return [];
    }

    if (movies.length === 0) return [];

    // Since our app uses TMDB format, we should probably fetch the TMDB data for these movies
    // but the prompt implies fetching them to show on the homepage.
    // If they have IMDB IDs, we might fetch from TMDB via find.
    const curatedMovies = await Promise.all(
      movies.map(async (m) => {
        if (!TMDB_API_KEY || !m.imdb_id) return null;
        try {
          const res = await tmdb.get(`/find/${m.imdb_id}`, { params: { external_source: 'imdb_id' } });
          const foundMovies = res.data.movie_results;
          if (foundMovies && foundMovies.length > 0) {
            return foundMovies[0];
          }
        } catch (err) {
          console.warn("Error resolving TMDB info for curated movie:", m.imdb_id);
        }
        return null;
      })
    );
    
    return curatedMovies.filter((m) => m !== null) as Movie[];
  } catch (err) {
    console.warn("Curated Downloads Error:", err);
    return [];
  }
};

export const getRecentlyUploadedMovies = async (): Promise<Movie[]> => {
  try {
    const { data: recentMovies, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !recentMovies || recentMovies.length === 0) {
      if (error) console.warn("Supabase recently uploaded error:", error);
      return [];
    }

    return recentMovies.map((m) => ({
      id: m.id,
      title: m.title,
      original_title: m.title,
      overview: m.overview || `Recently uploaded: ${m.title}`,
      poster_path: m.poster_url || m.poster_path || null,
      poster_url: m.poster_url || null,
      backdrop_path: m.backdrop_url || m.backdrop_path || null,
      release_date: m.created_at || m.release_date,
      vote_average: typeof m.vote_average === 'number' ? m.vote_average : (typeof m.rating === 'number' ? m.rating : 8.0),
      vote_count: m.vote_count || 100,
      genre_ids: [],
      category: m.category || "Recently Added",
      media_type: "movie",
      imdb_id: m.imdb_id,
    } as any));
  } catch (err) {
    console.warn("Error fetching recently uploaded movies:", err);
    return [];
  }
};

export const getPopularMovies = async (page = 1): Promise<Movie[]> => {
  if (!TMDB_API_KEY) return mockMovies;
  try {
    const res = await tmdb.get("/movie/popular", { params: { page } });
    return res.data.results;
  } catch (err) {
    console.warn("TMDB API Error:", err.message);
    return mockMovies;
  }
};

export const getTopRatedMovies = async (page = 1): Promise<Movie[]> => {
  if (!TMDB_API_KEY) return mockMovies;
  try {
    const res = await tmdb.get("/movie/top_rated", { params: { page } });
    return res.data.results;
  } catch (err) {
    console.warn("TMDB API Error:", err.message);
    return mockMovies;
  }
};

export const getNowPlayingMovies = async (page = 1): Promise<Movie[]> => {
  if (!TMDB_API_KEY) return mockMovies;
  try {
    const res = await tmdb.get("/movie/now_playing", { params: { page } });
    return res.data.results;
  } catch (err) {
    console.warn("TMDB API Error:", err.message);
    return mockMovies;
  }
};

export const getUpcomingMovies = async (page = 1): Promise<Movie[]> => {
  if (!TMDB_API_KEY) return mockMovies;
  try {
    const res = await tmdb.get("/movie/upcoming", { params: { page } });
    return res.data.results;
  } catch (err) {
    console.warn("TMDB API Error:", err.message);
    return mockMovies;
  }
};

const defaultGenres = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" }
];

export const getGenres = async (): Promise<{id: number, name: string}[]> => {
  if (!TMDB_API_KEY) return defaultGenres;
  try {
    const res = await tmdb.get("/genre/movie/list");
    return res.data.genres || defaultGenres;
  } catch (err: any) {
    console.warn("TMDB API Error:", err?.message || err);
    return defaultGenres;
  }
};

export const genreNameMap: Record<number, string> = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

export const getPrimaryGenre = (genreIds?: number[]): string | null => {
  if (!genreIds || genreIds.length === 0) return null;
  return genreNameMap[genreIds[0]] || null;
};

const createMockMoviesForGenre = (genreId: number, genreName: string): Movie[] => {
  return Array.from({ length: 12 }).map((_, i) => ({
    id: genreId * 1000 + i + 1,
    title: `${genreName} Blockbuster ${i + 1}`,
    original_title: `${genreName} Blockbuster ${i + 1}`,
    overview: `An incredible ${genreName.toLowerCase()} film that takes viewers on a high-octane journey filled with compelling stories and dramatic twists.`,
    poster_path: null,
    backdrop_path: null,
    release_date: `2024-0${(i % 9) + 1}-10`,
    vote_average: Math.max(6.5, 9.2 - i * 0.25),
    vote_count: 850 + i * 200,
    genre_ids: [genreId],
    media_type: "movie",
  }));
};

export const getMoviesByGenre = async (genreId: number, page = 1): Promise<Movie[]> => {
  if (!TMDB_API_KEY) {
    const genreName = genreNameMap[genreId] || "Featured";
    return createMockMoviesForGenre(genreId, genreName);
  }
  try {
    const res = await tmdb.get("/discover/movie", { 
      params: { 
        with_genres: genreId, 
        page,
        sort_by: "popularity.desc" 
      } 
    });
    return res.data.results;
  } catch (err: any) {
    console.warn("TMDB API Error:", err?.message || err);
    const genreName = genreNameMap[genreId] || "Featured";
    return createMockMoviesForGenre(genreId, genreName);
  }
};

export const getTrendingMovies = async (): Promise<Movie[]> => {
  if (!TMDB_API_KEY) return mockMovies;
  try {
    const res = await tmdb.get("/trending/movie/day");
    return res.data.results;
  } catch (err) {
    console.warn("TMDB API Error:", err.message);
    return mockMovies;
  }
};

export const searchMulti = async (query: string): Promise<Movie[]> => {
  if (!query) return [];
  let results: Movie[] = [];

  // 1. Search Supabase for Custom/Scraped Movies
  try {
    const cleanQuery = query.replace(/[^a-zA-Z0-9\s-]/g, "").trim();
    const { data: supaMovies, error } = await supabase
      .from('movies')
      .select('id, imdb_id, title, poster_url, category, created_at')
      .or(`title.ilike.%${cleanQuery}%,slug.ilike.%${cleanQuery}%`)
      .limit(10);

    if (!error && supaMovies && supaMovies.length > 0) {
      // Map Supabase movies to the TMDB Movie format expected by the app
      const supaResults: Movie[] = supaMovies.map(m => ({
        id: m.id, // Can be string/UUID now
        title: m.title,
        original_title: m.title,
        overview: `Custom added movie: ${m.title}`,
        poster_path: m.poster_url,
        backdrop_path: null,
        release_date: m.created_at,
        vote_average: 10.0, // Highlight custom movies
        vote_count: 100,
        genre_ids: [],
        media_type: "movie",
        // We can attach the real Supabase ID or IMDb ID to use later in details if needed
        imdb_id: m.imdb_id
      } as any));
      results = [...supaResults];
    }
  } catch (err) {
    console.warn("Supabase search error:", err);
  }

  // 2. Search TMDB
  if (TMDB_API_KEY) {
    try {
      const res = await tmdb.get("/search/multi", { params: { query } });
      const tmdbResults = res.data.results.filter((item: any) => item.media_type === "movie" || item.media_type === "tv");
      
      // Merge and remove duplicates by title
      const existingTitles = new Set(results.map(r => r.title.toLowerCase()));
      for (const tItem of tmdbResults) {
        if (!existingTitles.has((tItem.title || tItem.name || '').toLowerCase())) {
          results.push(tItem);
        }
      }
    } catch (err: any) {
      console.warn("TMDB API Error:", err.message);
    }
  } else if (results.length === 0) {
    results = mockMovies.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()));
  }

  return results;
};

export const fetchMediaDetails = async (
  id: number | string,
  mediaType?: "movie" | "tv" | string | null
): Promise<MovieDetails | null> => {
  if (!TMDB_API_KEY) {
    return {
      ...mockMovies[0],
      id,
      title: "Detailed Media",
      runtime: 120,
      genres: [{ id: 28, name: "Action" }, { id: 12, name: "Adventure" }],
      external_ids: { imdb_id: "tt1234567" },
      media_type: (mediaType as any) || "movie",
    };
  }

  // If the ID is clearly a string (like a UUID from Supabase), query Supabase directly
  if (typeof id === 'string' && isNaN(Number(id))) {
    try {
      const { data: m, error } = await supabase
        .from('movies')
        .select('*')
        .eq('id', id)
        .single();
        
      if (!error && m) {
        return {
          id: m.id,
          title: m.title,
          original_title: m.title,
          overview: `Custom added content: ${m.title}`,
          poster_path: m.poster_url,
          backdrop_path: m.backdrop_url,
          release_date: m.created_at,
          vote_average: 10.0,
          vote_count: 100,
          genre_ids: [],
          runtime: 120,
          genres: m.category ? [{ id: 1, name: m.category }] : [],
          media_type: m.media_type || (mediaType as any) || "movie",
          external_ids: { imdb_id: m.imdb_id }
        };
      }
    } catch (e) {
      console.warn("Supabase detail fetch error:", e);
    }
  }

  const primaryType: "movie" | "tv" = mediaType === "tv" ? "tv" : "movie";
  const secondaryType: "movie" | "tv" = primaryType === "movie" ? "tv" : "movie";

  const fetchFromTmdb = async (type: "movie" | "tv") => {
    const res = await tmdb.get(`/${type}/${id}`, {
      params: { append_to_response: "credits,external_ids,similar,videos" },
    });
    const data = res.data;
    if (data) {
      const isTv = type === "tv";
      return {
        ...data,
        id: data.id || id,
        title: data.title || data.name || data.original_name || data.original_title || "Untitled",
        original_title: data.original_title || data.original_name || data.title || data.name || "Untitled",
        release_date: data.release_date || data.first_air_date || "",
        runtime: data.runtime || (data.episode_run_time && data.episode_run_time[0]) || 45,
        media_type: isTv ? "tv" : "movie",
      };
    }
    return null;
  };

  // Primary attempt based on requested mediaType
  try {
    const result = await fetchFromTmdb(primaryType);
    if (result) return result;
  } catch (err: any) {
    console.warn(`TMDB ${primaryType}/${id} fetch failed (${err?.response?.status || err?.message}). Attempting automatic fallback to ${secondaryType}...`);
    // Auto-fallback: If primary type returned 404/failed, retry with secondary type
    try {
      const fallbackResult = await fetchFromTmdb(secondaryType);
      if (fallbackResult) return fallbackResult;
    } catch (fallbackErr: any) {
      console.warn(`TMDB ${secondaryType}/${id} auto-fallback fetch also failed:`, fallbackErr?.message || fallbackErr);
    }
  }

  // Final fallback to Supabase by numeric or string ID
  try {
    const { data: m, error } = await supabase
      .from('movies')
      .select('*')
      .eq('id', id)
      .single();
      
    if (!error && m) {
      return {
        id: m.id,
        title: m.title,
        original_title: m.title,
        overview: `Custom content: ${m.title}`,
        poster_path: m.poster_url,
        backdrop_path: m.backdrop_url,
        release_date: m.created_at,
        vote_average: 10.0,
        vote_count: 100,
        genre_ids: [],
        runtime: 120,
        genres: m.category ? [{ id: 1, name: m.category }] : [],
        media_type: m.media_type || (mediaType as any) || "movie",
        external_ids: { imdb_id: m.imdb_id }
      };
    }
  } catch (e) {
    console.warn("Supabase final fallback fetch error:", e);
  }

  return null;
};

export const getMovieDetails = fetchMediaDetails;

export const getRatings = async (imdbId: string | null): Promise<Ratings> => {
  if (!OMDB_API_KEY || !imdbId) return { imdb: null, rottenTomatoes: null };
  try {
    const res = await axios.get<OMDbResponse>(`https://www.omdbapi.com/`, {
      params: { i: imdbId, apikey: OMDB_API_KEY },
    });
    
    let rottenTomatoes: string | null = null;
    if (res.data.Ratings) {
      const rt = res.data.Ratings.find((r) => r.Source === "Rotten Tomatoes");
      if (rt) rottenTomatoes = rt.Value;
    }
    return {
      imdb: res.data.imdbRating || null,
      rottenTomatoes,
    };
  } catch (err) {
    console.warn("OMDb API Error: Could not fetch ratings. Invalid API key or network issue.");
    return { imdb: null, rottenTomatoes: null };
  }
};

export function formatBytes(bytes: number | string | undefined, decimals = 1): string {
  if (!bytes) return "Unknown size";
  const num = typeof bytes === "string" ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num === 0) return "Unknown size";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(num) / Math.log(k));
  return parseFloat((num / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export interface SourceProgress {
  source: "Supabase" | "YTS" | "Web Scraper" | "Internet Archive" | "Direct Cloud";
  status: "pending" | "checking" | "found" | "failed";
}

export const recordNotificationRequest = async (
  imdbId: string | null,
  title: string,
  email?: string
): Promise<boolean> => {
  try {
    const res = await axios.post("/api/notify-request", { imdbId, title, email }, { timeout: 5000 });
    return res.data?.success ?? true;
  } catch (err) {
    console.warn("Failed sending notification request:", err);
    return true;
  }
};

export const unrestrictDebridLink = async (
  magnetUrl: string,
  debridKey?: string
): Promise<string | null> => {
  try {
    const res = await axios.post("/api/unrestrict-debrid", { magnetUrl, debridKey }, { timeout: 8000 });
    return res.data?.directUrl || null;
  } catch (err) {
    console.warn("Failed unrestricting Real-Debrid link:", err);
    return null;
  }
};

export const resolveDownloadLinks = async (
  imdbId: string | null,
  title: string,
  onProgress?: (progress: SourceProgress[]) => void,
  year?: string | number
): Promise<DownloadResolverResult> => {
  const progressState: SourceProgress[] = [
    { source: "Supabase", status: "pending" },
    { source: "YTS", status: "pending" },
    { source: "Web Scraper", status: "pending" },
    { source: "Internet Archive", status: "pending" },
  ];

  const updateProgress = (
    source: "Supabase" | "YTS" | "Web Scraper" | "Internet Archive" | "Direct Cloud",
    status: "checking" | "found" | "failed"
  ) => {
    const item = progressState.find((p) => p.source === source);
    if (item) item.status = status;
    if (onProgress) onProgress([...progressState]);
  };

  // Try API route first (/api/download-resolver)
  // Or check Supabase Custom Downloads directly!
  updateProgress("Supabase", "checking");
  try {
    let movieData: any = null;

    const movieSlug = (title || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const movieTarget = {
      title: title || "",
      imdb_id: imdbId || null,
      slug: movieSlug,
    };

    // Priority 1: Direct match by slug or exact title
    try {
      let { data } = await supabase
        .from('movies')
        .select('*')
        .or(`slug.eq.${movieTarget.slug},title.eq.${movieTarget.title}`)
        .maybeSingle();

      movieData = data;
    } catch (e1) {
      console.warn("Priority 1 .or() query failed, trying individual fallbacks:", e1);
    }

    if (!movieData) {
      try {
        let { data: slugMatch } = await supabase
          .from('movies')
          .select('*')
          .eq('slug', movieTarget.slug)
          .maybeSingle();

        if (slugMatch) {
          movieData = slugMatch;
        } else if (movieTarget.title) {
          let { data: titleMatch } = await supabase
            .from('movies')
            .select('*')
            .eq('title', movieTarget.title)
            .maybeSingle();
          movieData = titleMatch;
        }
      } catch (eFallback) {
        console.warn("Priority 1 fallback query failed:", eFallback);
      }
    }

    // Priority 2: Match by imdb_id if available
    if (!movieData && movieTarget.imdb_id) {
      try {
        let { data: imdbMatch } = await supabase
          .from('movies')
          .select('*')
          .eq('imdb_id', movieTarget.imdb_id)
          .maybeSingle();
        movieData = imdbMatch;
      } catch (e2) {
        console.warn("Priority 2 query error:", e2);
      }
    }

    // Priority 3: Flexible partial match on clean title
    if (!movieData && movieTarget.title) {
      try {
        const baseTitle = movieTarget.title.replace(/S\d+.*|\(Complete\)|Episode.*/gi, '').trim();
        if (baseTitle) {
          let { data: partialMatch } = await supabase
            .from('movies')
            .select('*')
            .ilike('title', `%${baseTitle}%`)
            .limit(1);

          if (partialMatch && partialMatch.length > 0) {
            movieData = partialMatch[0];
          }
        }
      } catch (e3) {
        console.warn("Priority 3 query error:", e3);
      }
    }

    if (movieData) {
      // Data Handling: Extract download_servers array and handle stringified JSON
      let rawServers = movieData.download_servers;
      if (typeof rawServers === 'string') {
        try {
          rawServers = JSON.parse(rawServers);
        } catch (e) {
          console.warn("Failed parsing stringified download_servers JSON:", e);
          rawServers = [];
        }
      }

      let serversArray: any[] = [];
      if (Array.isArray(rawServers)) {
        serversArray = rawServers;
      } else if (rawServers && typeof rawServers === 'object') {
        serversArray = Object.values(rawServers);
      }

      // Also support single download_url or url on movieData object
      if (serversArray.length === 0 && (movieData.download_url || movieData.url)) {
        serversArray = [{
          server_name: "Supabase Direct CDN",
          url: movieData.download_url || movieData.url,
          quality: movieData.quality || "HD",
          file_size: movieData.file_size || "Unknown Size"
        }];
      }

      const validSources: DownloadSource[] = serversArray
        .filter((d: any) => d && (d.url || d.download_url) && String(d.url || d.download_url).trim().length > 0)
        .map((d: any, idx: number) => ({
          id: d.id || `supa-${movieData.id || "m"}-${idx}`,
          source: d.server_name || d.name || "Supabase",
          quality: d.quality || "HD",
          type: "direct",
          url: d.url || d.download_url,
          size: d.file_size || d.size || movieData.file_size || "Unknown Size",
          format: d.format || "MP4/MKV",
          uploaderName: movieData.uploader_name || "Huncho Scraper"
        }));

      if (validSources.length > 0) {
        updateProgress("Supabase", "found");
        return {
          title: movieData.title || title,
          imdbId: movieData.imdb_id || imdbId,
          sources: validSources,
          activeSourceType: "Supabase",
        };
      }
    }
  } catch (err) {
    console.warn("Supabase downloads fetch failed:", err);
  }
  updateProgress("Supabase", "failed");

  // Fallback direct client-side checks if API endpoint is unreachable or returned empty
  updateProgress("YTS", "checking");
  if (imdbId) {
    try {
      const ytsUrl = `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(imdbId)}`;
      const res = await axios.get(ytsUrl, { timeout: 5000 });
      const movieData = res.data?.data;
      if (movieData && movieData.movie_count > 0 && movieData.movies?.[0]?.torrents?.length > 0) {
        const ytsMovie = movieData.movies[0];
        const torrents = ytsMovie.torrents;
        const rawSources: DownloadSource[] = torrents.map((t: any, idx: number) => {
          const qualityStr = `${t.quality || "1080p"} ${t.type ? t.type.toUpperCase() : "WEBRip"}`;
          const magnetUrl = t.hash
            ? `magnet:?xt=urn:btih:${t.hash}&dn=${encodeURIComponent(ytsMovie.title || title)}&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:8080&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce`
            : t.url;
          return {
            id: `yts-${t.hash || idx}`,
            source: "YTS",
            quality: qualityStr,
            type: t.hash ? "magnet" : "torrent",
            url: magnetUrl || "",
            size: t.size || "Unknown",
            seeds: t.seeds,
            peers: t.peers,
            format: t.type || "MP4/MKV",
            hash: t.hash,
          };
        });

        const validSources = rawSources.filter((s) => Boolean(s.url && s.url.trim().length > 0));

        if (validSources.length > 0) {
          updateProgress("YTS", "found");
          return {
            title: ytsMovie.title || title,
            imdbId,
            sources: validSources,
            activeSourceType: "YTS",
          };
        }
      }
    } catch (err) {
      console.warn("YTS API fetch failed or timed out:", err);
    }
  }
  updateProgress("YTS", "failed");

  // Web Scraper Tier
  updateProgress("Web Scraper", "failed");

  // Internet Archive Tier
  updateProgress("Internet Archive", "checking");
  try {
    const cleanTitle = title.replace(/[^a-zA-Z0-9\s]/g, "").trim();
    const iaSearchUrl = `https://archive.org/advancedsearch.php?q=title:("${encodeURIComponent(cleanTitle)}") AND mediatype:movies&output=json&fields=identifier,title`;
    const searchRes = await axios.get(iaSearchUrl, { timeout: 6000 });
    const docs = searchRes.data?.response?.docs;

    if (docs && docs.length > 0) {
      for (const doc of docs.slice(0, 3)) {
        const identifier = doc.identifier;
        if (!identifier) continue;

        try {
          const metaUrl = `https://archive.org/metadata/${identifier}/files`;
          const metaRes = await axios.get(metaUrl, { timeout: 5000 });
          const files = metaRes.data?.files || [];

          const videoFiles = files.filter((f: any) => {
            if (!f.name) return false;
            const ext = f.name.split(".").pop()?.toLowerCase();
            const format = (f.format || "").toLowerCase();
            const isVideoExt = ["mp4", "mkv", "avi", "mov"].includes(ext || "");
            const isVideoFormat = format.includes("mp4") || format.includes("mpeg") || format.includes("512kb");
            const isExcluded =
              f.name.includes("_thumb") ||
              f.name.includes("_xml") ||
              f.name.endsWith(".png") ||
              f.name.endsWith(".jpg") ||
              f.name.endsWith(".sqlite");
            return (isVideoExt || isVideoFormat) && !isExcluded;
          });

          if (videoFiles.length > 0) {
            const rawSources: DownloadSource[] = videoFiles.slice(0, 5).map((vf: any, idx: number) => {
              const fileExt = vf.name.split(".").pop()?.toUpperCase() || "MP4";
              const sizeStr = formatBytes(vf.size);
              const heightLabel = vf.height ? `${vf.height}p` : "HD";
              return {
                id: `ia-${identifier}-${idx}`,
                source: "Internet Archive",
                quality: `${heightLabel} ${fileExt} Direct Stream`,
                type: "direct",
                url: `https://archive.org/download/${identifier}/${encodeURIComponent(vf.name)}`,
                size: sizeStr,
                format: fileExt,
              };
            });

            const validSources = rawSources.filter((s) => Boolean(s.url && s.url.trim().length > 0));

            if (validSources.length > 0) {
              updateProgress("Internet Archive", "found");
              return {
                title: doc.title || title,
                imdbId,
                sources: validSources,
                activeSourceType: "Internet Archive",
              };
            }
          }
        } catch (mErr) {
          console.warn(`Failed fetching Internet Archive metadata for ${identifier}`, mErr);
        }
      }
    }
  } catch (err) {
    console.warn("Internet Archive API fetch failed:", err);
  }
  updateProgress("Internet Archive", "failed");

  // Direct Cloud Tier
  updateProgress("Direct Cloud", "failed");

  // Strict Sanitization: If no sources yield valid, non-empty URLs
  return {
    title,
    imdbId,
    sources: [],
    activeSourceType: null,
  };
};

