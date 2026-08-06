import { useEffect, useState, useRef, useCallback } from "react";
import { Movie } from "../types";
import { getMoviesByGenre, getPopularMovies, getTopRatedMovies, getUpcomingMovies, getNowPlayingMovies, getImageUrl } from "../lib/api";
import { useStore } from "../lib/store";
import { Star } from "lucide-react";

export function MovieGrid({ category }: { category: number | string }) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const setSelectedMovieId = useStore((s) => s.setSelectedMovieId);

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
    
    if (newMovies.length === 0) {
      setHasMore(false);
    } else {
      setMovies((prev) => (pageNum === 1 ? newMovies : [...prev, ...newMovies]));
      setHasMore(newMovies.length > 0); // Assuming there's more if we got results, could check for a specific length like 20
    }
    setLoading(false);
  };

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
    loadMovies(1);
  }, [category]);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && hasMore && !loading) {
        setPage((prev) => {
          const nextPage = prev + 1;
          loadMovies(nextPage);
          return nextPage;
        });
      }
    },
    [loading, hasMore, category]
  );

  const sentinelRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();
      
      observerRef.current = new IntersectionObserver(handleObserver, {
        root: null,
        rootMargin: "20px",
        threshold: 1.0,
      });
      
      if (node) observerRef.current.observe(node);
    },
    [loading, handleObserver]
  );

  if (!movies.length && loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-4 animate-in fade-in duration-500">
      <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
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
            <div className="p-2 xs:p-3 flex flex-col flex-1">
              <h4 className="text-xs xs:text-sm font-semibold text-slate-900 line-clamp-1 mt-1.5 leading-tight">
                {movie.title || movie.original_title}
              </h4>
              <div className="flex items-center justify-between mt-auto pt-2">
                <span className="text-[10px] xs:text-xs text-slate-500 flex items-center gap-1">
                  {movie.release_date?.slice(0, 4)}
                </span>
                <span className="text-[10px] xs:text-xs text-slate-500 flex items-center gap-1 font-bold">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  {movie.vote_average?.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="mt-12 flex justify-center py-4">
          {loading && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          )}
        </div>
      )}
      {!hasMore && (
        <div className="mt-12 flex justify-center py-4 text-sm text-slate-500">
          No more movies to load.
        </div>
      )}
    </div>
  );
}
