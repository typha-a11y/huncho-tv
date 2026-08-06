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
    console.error("TMDB API Error:", err);
    return mockMovies;
  }
};

export const getTopRatedMovies = async (page = 1): Promise<Movie[]> => {
  if (!TMDB_API_KEY) return mockMovies;
  try {
    const res = await tmdb.get("/movie/top_rated", { params: { page } });
    return res.data.results;
  } catch (err) {
    console.error("TMDB API Error:", err);
    return mockMovies;
  }
};

export const getNowPlayingMovies = async (page = 1): Promise<Movie[]> => {
  if (!TMDB_API_KEY) return mockMovies;
  try {
    const res = await tmdb.get("/movie/now_playing", { params: { page } });
    return res.data.results;
  } catch (err) {
    console.error("TMDB API Error:", err);
    return mockMovies;
  }
};

export const getUpcomingMovies = async (page = 1): Promise<Movie[]> => {
  if (!TMDB_API_KEY) return mockMovies;
  try {
    const res = await tmdb.get("/movie/upcoming", { params: { page } });
    return res.data.results;
  } catch (err) {
    console.error("TMDB API Error:", err);
    return mockMovies;
  }
};

export const getGenres = async (): Promise<{id: number, name: string}[]> => {
  if (!TMDB_API_KEY) return [{ id: 28, name: "Action" }, { id: 12, name: "Adventure" }, { id: 16, name: "Animation" }, { id: 35, name: "Comedy" }, { id: 80, name: "Crime" }];
  try {
    const res = await tmdb.get("/genre/movie/list");
    return res.data.genres;
  } catch (err) {
    console.error("TMDB API Error:", err);
    return [];
  }
};

export const getMoviesByGenre = async (genreId: number, page = 1): Promise<Movie[]> => {
  if (!TMDB_API_KEY) return mockMovies;
  try {
    const res = await tmdb.get("/discover/movie", { params: { with_genres: genreId, page } });
    return res.data.results;
  } catch (err) {
    console.error("TMDB API Error:", err);
    return mockMovies;
  }
};

export const getTrendingMovies = async (): Promise<Movie[]> => {
  if (!TMDB_API_KEY) return mockMovies;
  try {
    const res = await tmdb.get("/trending/movie/day");
    return res.data.results;
  } catch (err) {
    console.error("TMDB API Error:", err);
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
    console.error("TMDB API Error:", err);
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
      params: { append_to_response: "credits,external_ids,similar" },
    });
    return res.data;
  } catch (err) {
    console.error("TMDB API Error:", err);
    return null;
  }
};

export const getRatings = async (imdbId: string | null): Promise<Ratings> => {
  if (!OMDB_API_KEY || !imdbId) return { imdb: null, rottenTomatoes: null };
  try {
    const res = await axios.get<OMDBResponse>(`https://www.omdbapi.com/`, {
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
    console.error("OMDb API Error:", err);
    return { imdb: null, rottenTomatoes: null };
  }
};
