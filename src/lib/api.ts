import axios from "axios";
import { Movie, MovieDetails, Ratings, OMDbResponse, DownloadSource, DownloadResolverResult } from "../types";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const OMDB_API_KEY = import.meta.env.VITE_OMDB_API_KEY;

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const getImageUrl = (path: string | null, size: "w500" | "original" = "w500") => {
  if (!path) return "https://via.placeholder.com/500x750?text=No+Poster";
  return `https://image.tmdb.org/t/p/${size}${path}`;
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
  if (!TMDB_API_KEY) return mockMovies.filter((m) => m.title.toLowerCase().includes(query.toLowerCase()));
  if (!query) return [];
  try {
    const res = await tmdb.get("/search/multi", { params: { query } });
    return res.data.results.filter((item: any) => item.media_type === "movie" || item.media_type === "tv");
  } catch (err) {
    console.warn("TMDB API Error:", err.message);
    return [];
  }
};

export const getMovieDetails = async (id: number): Promise<MovieDetails | null> => {
  if (!TMDB_API_KEY) {
    return {
      ...mockMovies[0],
      id,
      title: "Detailed Movie",
      runtime: 120,
      genres: [{ id: 28, name: "Action" }, { id: 12, name: "Adventure" }],
      external_ids: { imdb_id: "tt1234567" },
    };
  }
  try {
    const res = await tmdb.get(`/movie/${id}`, {
      params: { append_to_response: "credits,external_ids,similar,videos" },
    });
    return res.data;
  } catch (err) {
    console.warn("TMDB API Error: Could not fetch movie details.");
    return null;
  }
};

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
  updateProgress("Supabase", "checking");
  try {
    const yearQuery = year ? `&year=${encodeURIComponent(String(year))}` : "";
    const resolverApiUrl = `/api/download-resolver?imdb_id=${encodeURIComponent(imdbId || "")}&title=${encodeURIComponent(title)}${yearQuery}`;
    const apiRes = await axios.get(resolverApiUrl, { timeout: 8000 });
    
    if (apiRes.data && apiRes.data.sources && Array.isArray(apiRes.data.sources)) {
      const validSources: DownloadSource[] = apiRes.data.sources.filter(
        (s: DownloadSource) => Boolean(s.url && typeof s.url === "string" && s.url.trim().length > 0)
      );

      if (validSources.length > 0) {
        const activeSource = apiRes.data.activeSourceType || validSources[0]?.source || "Supabase";
        
        // Update progress for all tiers based on what was active
        if (activeSource === "Supabase") {
          updateProgress("Supabase", "found");
        } else if (activeSource === "YTS" || activeSource === "Real-Debrid") {
          updateProgress("Supabase", "failed");
          updateProgress("YTS", "found");
        } else if (activeSource === "Web Scraper") {
          updateProgress("Supabase", "failed");
          updateProgress("YTS", "failed");
          updateProgress("Web Scraper", "found");
        } else if (activeSource === "Internet Archive") {
          updateProgress("Supabase", "failed");
          updateProgress("YTS", "failed");
          updateProgress("Web Scraper", "failed");
          updateProgress("Internet Archive", "found");
        } else if (activeSource === "Direct Cloud") {
          updateProgress("YTS", "failed");
          updateProgress("Web Scraper", "failed");
          updateProgress("Internet Archive", "failed");
          updateProgress("Direct Cloud", "found");
        }

        return {
          title: apiRes.data.title || title,
          imdbId,
          sources: validSources,
          activeSourceType: activeSource,
        };
      }
    }
  } catch {
    // API resolver endpoint unreachable; fall through quietly
  }

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

