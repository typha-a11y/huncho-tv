import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Movie } from "../types";
import { getMoviesByGenre, getPopularMovies, getTopRatedMovies, getUpcomingMovies, getNowPlayingMovies, getPrimaryGenre } from "../lib/api";
import { useStore } from "../lib/store";
import { Star } from "lucide-react";
import { MoviePosterImage } from "./MoviePosterImage";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  }
};

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
      setMovies((prev) => {
        if (pageNum === 1) return newMovies;
        const existingIds = new Set(prev.map((m) => m.id));
        const uniqueNew = newMovies.filter((m) => !existingIds.has(m.id));
        return [...prev, ...uniqueNew];
      });
      setHasMore(newMovies.length > 0);
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
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
        />
      </div>
    );
  }

  return (
    <div className="py-4">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4"
      >
        <AnimatePresence mode="popLayout">
          {movies.map((movie, index) => (
            <motion.div
              key={`${movie.id}-${index}`}
              variants={cardVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedMovieId(movie.id)}
              className="group cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200/60 bg-white transition-shadow duration-200 ease-out flex flex-col"
            >
              <div className="aspect-[2/3] overflow-hidden bg-slate-100 relative">
                <MoviePosterImage
                  src={(movie as any).poster_url || movie.poster_path}
                  title={movie.title || movie.original_title}
                  alt={movie.title || movie.original_title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {getPrimaryGenre(movie.genre_ids) && (
                  <span className="absolute top-1.5 left-1.5 px-1 py-[1px] bg-slate-900/65 backdrop-blur-md text-white text-[7px] font-semibold rounded-[3px] border border-white/20 leading-none shadow-xs">
                    {getPrimaryGenre(movie.genre_ids)}
                  </span>
                )}
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
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

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
