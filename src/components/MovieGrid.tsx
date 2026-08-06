import { useEffect, useState } from "react";
import { Movie } from "../types";
import { getMoviesByGenre, getPopularMovies, getTopRatedMovies, getUpcomingMovies, getNowPlayingMovies, getImageUrl } from "../lib/api";
import { useStore } from "../lib/store";
import { Star } from "lucide-react";

export function MovieGrid({ category }: { category: number | string }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const setSelectedMovieId = useStore((s) => s.setSelectedMovieId);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    loadMovies(1);
  }, [category]);

  const loadMovies = async (pageNum: number) => {
    setLoading(true);
    let newMovies: Movie[] = [];
    if (typeof category === "number") {
      newMovies = await getMoviesByGenre(category, pageNum);
    } else if (category === "popular") {
      newMovies = await getPopularMovies(pageNum);
    } else if (category === "top_rated") {
      newMovies = await getTopRatedMovies(pageNum);
    } else if (category === "now_playing") {
      newMovies = await getNowPlayingMovies(pageNum);
    } else if (category === "upcoming") {
      newMovies = await getUpcomingMovies(pageNum);
    }
    
    setMovies((prev) => (pageNum === 1 ? newMovies : [...prev, ...newMovies]));
    setLoading(false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadMovies(nextPage);
  };

  if (!movies.length && loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {movies.map((movie) => (
          <div
            key={movie.id}
            onClick={() => setSelectedMovieId(movie.id)}
            className="group cursor-pointer rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 bg-white hover:scale-[1.02] transition-transform duration-200 ease-out flex flex-col"
          >
            <div className="aspect-[2/3] overflow-hidden bg-slate-100">
              <img
                src={getImageUrl(movie.poster_path, "w500")}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-4 flex flex-col flex-1">
              <h4 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">
                {movie.title || movie.original_title}
              </h4>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-slate-500 text-xs font-medium">
                  {movie.release_date?.slice(0, 4)}
                </span>
                <span className="text-slate-700 text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {movie.vote_average?.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <button
          onClick={handleLoadMore}
          disabled={loading}
          className="bg-white hover:bg-slate-50 text-slate-900 font-bold px-8 py-3 rounded-xl border border-slate-200 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      </div>
    </div>
  );
}
