import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "motion/react";
import { Movie } from "../types";
import { getMoviesByGenre, getPopularMovies, getTopRatedMovies, getUpcomingMovies, getNowPlayingMovies, getPrimaryGenre, isTmdbConfigured } from "../lib/api";
import { useStore } from "../lib/store";
import { Star, AlertCircle } from "lucide-react";
import { MoviePosterImage } from "./MoviePosterImage";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.01
    }
  },
  exit: {
    transition: { staggerChildren: 0.02, staggerDirection: -1 }
  }
};

const cardVariants: Variants = {
  hidden: { 
    scale: 0.82, 
    y: 38, 
    rotateX: 20, 
    rotateY: -4,
    transformPerspective: 1100,
    transformOrigin: "center bottom"
  },
  show: { 
    scale: 1, 
    y: 0, 
    rotateX: 0, 
    rotateY: 0,
    transformPerspective: 1100,
    transformOrigin: "center bottom",
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 22, 
      mass: 0.8 
    } 
  },
  exit: {
    scale: 0.88,
    y: 18,
    rotateX: -10,
    transformPerspective: 1100,
    transition: { duration: 0.16, ease: [0.4, 0, 1, 1] }
  }
};

function MovieGridSkeleton() {
  return (
    <div className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div 
          key={i} 
          className="rounded-2xl overflow-hidden border border-slate-200/60 bg-white shadow-2xs flex flex-col animate-pulse"
        >
          <div className="aspect-[2/3] bg-slate-200/70 relative" />
          <div className="p-2 xs:p-3 space-y-2 flex-1 flex flex-col justify-between">
            <div className="h-3.5 bg-slate-200/80 rounded-md w-4/5" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-3 bg-slate-200/70 rounded w-1/3" />
              <div className="h-3 bg-slate-200/70 rounded w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

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

  if (!isTmdbConfigured && !movies.length && !loading) {
    return (
      <div className="p-8 my-6 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-3 max-w-lg mx-auto">
        <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto shadow-xs border border-amber-200">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-amber-950">TMDB Not Configured</h3>
          <p className="text-xs text-amber-800 leading-relaxed">
            Please add <code className="font-mono font-bold bg-amber-100/80 px-1.5 py-0.5 rounded text-amber-900 border border-amber-200">VITE_TMDB_API_KEY</code> to your environment variables to enable TMDB movie discovery and catalog browsing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 min-h-[400px]">
      <AnimatePresence mode="wait">
        {loading && !movies.length ? (
          <motion.div
            key={`skeleton-${category}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MovieGridSkeleton />
          </motion.div>
        ) : (
          <motion.div 
            key={`grid-${category}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4"
          >
            {movies.map((movie, index) => (
              <motion.div
                key={`${movie.id}-${index}`}
                layout
                role="button"
                tabIndex={0}
                aria-label={`View details for ${movie.title || movie.original_title}`}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.025, rotateX: -2, rotateY: 1 }}
                whileTap={{ scale: 0.96, y: -2, rotateX: 3 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                onClick={() => setSelectedMovieId(movie.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedMovieId(movie.id);
                  }
                }}
                className="group cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200/60 bg-white transition-shadow duration-200 ease-out flex flex-col focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              >
                <div className="aspect-[2/3] overflow-hidden bg-slate-100 relative">
                  <MoviePosterImage
                    src={(movie as any).poster_url || movie.poster_path || movie.backdrop_path}
                    posterPath={movie.poster_path || (movie as any).poster_url}
                    backdropPath={movie.backdrop_path}
                    title={movie.title || movie.original_title}
                    alt={movie.title || movie.original_title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {((movie as any).category || getPrimaryGenre(movie.genre_ids)) && (
                    <span className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 px-1 py-[1px] sm:px-1.5 sm:py-0.5 bg-slate-900/80 backdrop-blur-md text-white text-[7px] xs:text-[8px] sm:text-[9px] font-bold rounded-xs sm:rounded-md border border-white/20 leading-none shadow-xs uppercase tracking-tight max-w-[85%] truncate z-10 pointer-events-none">
                      {(movie as any).category || getPrimaryGenre(movie.genre_ids)}
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
          </motion.div>
        )}
      </AnimatePresence>

      {hasMore && (
        <div ref={sentinelRef} className="mt-12 flex justify-center py-4">
          {loading && movies.length > 0 && (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          )}
        </div>
      )}
      {!hasMore && movies.length > 0 && (
        <div className="mt-12 flex justify-center py-4 text-sm text-slate-500">
          No more movies to load.
        </div>
      )}
    </div>
  );
}
