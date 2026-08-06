export interface Movie {
  id: number;
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
  id: number;
  title: string;
  poster_path: string | null;
  progress: number;
  duration: number;
  updatedAt: number;
}
