import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bookmark, Star, Trash2, Play, Sparkles, ArrowUpDown } from "lucide-react";
import { useStore } from "../lib/store";
import { getMovieDetails, getImageUrl, getPrimaryGenre } from "../lib/api";
import { MovieDetails } from "../types";
import { MoviePosterImage } from "./MoviePosterImage";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    transition: { duration: 0.2 }
  }
};

type SortOption = "date" | "title" | "popularity";

export function WatchlistGrid({ onExplore }: { onExplore?: () => void }) {
  const { watchlist, removeFromWatchlist, setSelectedMovieId } = useStore();
  const [movies, setMovies] = useState<MovieDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("date");

  useEffect(() => {
    let isMounted = true;
    if (watchlist.length === 0) {
      setMovies([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const uniqueIds = Array.from(new Set(watchlist));
    Promise.all(uniqueIds.map((id) => getMovieDetails(id)))
      .then((results) => {
        if (isMounted) {
          // Filter out nulls if any fetch failed and keep unique
          const validMovies = results.filter((m): m is MovieDetails => m !== null);
          const seen = new Set<number | string>();
          const uniqueMovies = validMovies.filter((m) => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
          });
          setMovies(uniqueMovies);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch watchlist movies:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [watchlist]);

  const sortedMovies = useMemo(() => {
    return [...movies].sort((a, b) => {
      if (sortBy === "title") {
        return (a.title || a.original_title || "").localeCompare(b.title || b.original_title || "");
      }
      if (sortBy === "popularity") {
        return (b.vote_average || 0) - (a.vote_average || 0);
      }
      // "date": Sort by index in watchlist, descending (newest first)
      const indexA = watchlist.indexOf(a.id);
      const indexB = watchlist.indexOf(b.id);
      return indexB - indexA;
    });
  }, [movies, sortBy, watchlist]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"
        />
        <p className="text-xs text-slate-500 font-medium">Loading your watchlist...</p>
      </div>
    );
  }

  if (watchlist.length === 0 || movies.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-16 px-4 flex flex-col items-center text-center max-w-md mx-auto"
      >
        <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mb-4 shadow-xs">
          <Bookmark className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">Your Watchlist is Empty</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Save movies to watch later by clicking the <span className="font-semibold text-slate-700">+ Watchlist</span> button on any movie details page.
        </p>
        {onExplore && (
          <button
            onClick={onExplore}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Discover Movies</span>
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Bookmark className="w-5 h-5 text-indigo-600 fill-indigo-600/20" />
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Saved Movies</h2>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
            {movies.length}
          </span>
        </div>
        
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="date">Date Added</option>
              <option value="title">A-Z</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4"
      >
        <AnimatePresence mode="popLayout">
          {sortedMovies.map((movie, index) => {
            const genreName = getPrimaryGenre(movie.genre_ids) || (movie.genres?.[0]?.name);
            return (
              <motion.div
                key={`${movie.id}-${index}`}
                variants={cardVariants}
                layout
                whileHover={{ y: -4, scale: 1.02 }}
                onClick={() => setSelectedMovieId(movie.id)}
                className="group cursor-pointer rounded-2xl overflow-hidden shadow-sm hover:shadow-md border border-slate-200/60 bg-white transition-all duration-200 ease-out flex flex-col relative"
              >
                {/* Remove button overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchlist(movie.id);
                  }}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-slate-900/60 hover:bg-rose-600 text-white rounded-lg backdrop-blur-md transition-colors opacity-90 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Remove from Watchlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="aspect-[2/3] overflow-hidden bg-slate-100 relative">
                  <MoviePosterImage
                    src={(movie as any).poster_url || movie.poster_path || movie.backdrop_path}
                    posterPath={movie.poster_path || (movie as any).poster_url}
                    backdropPath={movie.backdrop_path}
                    title={movie.title || movie.original_title}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {genreName && (
                    <span className="absolute top-1.5 left-1.5 px-1 py-[1px] bg-slate-900/65 backdrop-blur-md text-white text-[7px] font-semibold rounded-[3px] border border-white/20 leading-none shadow-xs">
                      {genreName}
                    </span>
                  )}
                </div>

                <div className="p-2.5 xs:p-3 flex flex-col flex-1">
                  <h4 className="text-xs xs:text-sm font-semibold text-slate-900 line-clamp-1 mt-0.5 leading-tight">
                    {movie.title || movie.original_title}
                  </h4>
                  <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-[10px] xs:text-xs text-slate-500">
                      {movie.release_date?.slice(0, 4)}
                    </span>
                    <span className="text-[10px] xs:text-xs text-slate-500 flex items-center gap-1 font-bold">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      {movie.vote_average?.toFixed(1)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
