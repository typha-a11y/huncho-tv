export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number | string;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  media_type?: string;
  imdb_id?: string;
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: { id: number; name: string }[];
  credits?: {
    cast: {
      id: number;
      name: string;
      profile_path: string | null;
      character: string;
    }[];
  };
  external_ids?: {
    imdb_id: string | null;
  };
  similar?: {
    results: Movie[];
  };
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
    }[];
  };
}

export interface Ratings {
  imdb: string | null;
  rottenTomatoes: string | null;
}

export interface OMDbResponse {
  Ratings?: { Source: string; Value: string }[];
  imdbRating?: string;
  Rated?: string;
}

export interface WatchHistoryItem {
  id: number | string;
  title: string;
  poster_path: string | null;
  progress: number;
  duration: number;
  updatedAt: number;
}

export interface DownloadSource {
  id: string;
  source: "Supabase" | "YTS" | "Web Scraper" | "Internet Archive" | "Direct Cloud" | string;
  quality: string;
  type: "torrent" | "magnet" | "direct";
  url: string;
  size: string;
  seeds?: number;
  peers?: number;
  format?: string;
  hash?: string;
  uploaderName?: string;
}

export interface DownloadResolverResult {
  title: string;
  imdbId: string | null;
  sources: DownloadSource[];
  activeSourceType: "Supabase" | "YTS" | "Web Scraper" | "Internet Archive" | "Direct Cloud" | string | null;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  is_pro?: boolean;
  plan_type?: "daily" | "weekly" | "monthly" | "yearly";
  plan_name?: string;
  plan_price?: string;
  plan_expires_at?: string;
  created_at?: string;
}

export interface UserDownloadItem {
  id: string;
  movie_id: string;
  title: string;
  poster_path: string | null;
  quality: string;
  file_size: string;
  download_url: string;
  downloaded_at: string;
  duration?: string;
  source_type?: "Local Files" | "Received" | "Cloud";
}

export interface ZilizotafsiriwaMovie {
  id: string;
  title: string;
  originalTitle?: string;
  djName: string;            // e.g., "DJ Afro", "DJ Murphy", "DJ Mack", "DJ Rufus"
  posterUrl: string;
  backdropUrl?: string;
  releaseYear: number;
  streamUrl: string;          // Direct video/HLS stream URL or drive embed
  downloadUrl?: string;        // Direct download URL provided by admin
  fileSize?: string;          // e.g., "650 MB"
  quality?: string;           // e.g., "720p HD"
  synopsis?: string;
}

