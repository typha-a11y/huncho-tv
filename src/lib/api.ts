import axios from "axios";
import { Movie, MovieDetails, Ratings, OMDbResponse } from "../types";

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
