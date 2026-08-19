import { Play, Plus, Check, Star } from "lucide-react";
import { AnimatedFlame } from "./AnimatedFlame";
import { Movie } from "../types";
import { useStore } from "../lib/store";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";

export function HeroBanner({ movies, badge }: { movies: Movie[]; badge?: string }) {
  const { watchlist, addToWatchlist, removeFromWatchlist, setSelectedMovieId } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const topFive = movies.slice(0, 5);

  useEffect(() => {
    setCurrentIndex(0);
  }, [movies]);

  useEffect(() => {
    if (topFive.length === 0 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topFive.length);
    }, 3000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [topFive.length, isHovered]);

  const movie = topFive[currentIndex];

  if (topFive.length === 0) return <div className="w-full min-h-[420px] xs:min-h-[460px] bg-slate-200 animate-pulse rounded-3xl" />;

  const isWatchlisted = watchlist.includes(movie.id);
  const heroImageUrl = movie.backdrop_path && movie.backdrop_path.trim() !== ""
    ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` 
    : movie.poster_path && movie.poster_path.trim() !== ""
      ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
      : "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&auto=format&fit=crop&q=80";

  return (
    <div 
      className="relative w-full min-h-[420px] xs:min-h-[460px] rounded-3xl overflow-hidden shadow-xl cursor-pointer group flex flex-col justify-end bg-black"
      onClick={() => {
        setSelectedMovieId(movie.id, movie.media_type);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence mode="popLayout">
        <motion.img
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          src={heroImageUrl}
          alt={movie.title}
          onError={(e) => {
            const target = e.currentTarget;
            if (movie.poster_path && !target.src.includes(movie.poster_path)) {
              target.src = `https://image.tmdb.org/t/p/w780${movie.poster_path}`;
            } else {
              target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1280&auto=format&fit=crop&q=80";
            }
          }}
          className="absolute inset-0 w-full h-full object-cover object-top z-0"
        />
      </AnimatePresence>
      
      {/* Dark gradient overlay for bottom text */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
      
      <div className="relative z-20 p-5 flex flex-col gap-2">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/80 backdrop-blur-md rounded-full text-white text-[11px] font-bold w-fit shadow-md border border-amber-300/60">
              <AnimatedFlame className="w-3.5 h-3.5 fill-current text-amber-200" />
              <span>{badge}</span>
            </div>
          )}
          <AnimatePresence mode="wait">
            <motion.h1 
              key={movie.id + "title"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-xl xs:text-2xl sm:text-4xl font-black text-white drop-shadow-md"
            >
              {movie.title || movie.original_title}
            </motion.h1>
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            <motion.div 
              key={movie.id + "meta"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 text-xs text-slate-300 flex-wrap"
            >
              <span className="flex items-center gap-1 font-semibold">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {movie.vote_average?.toFixed(1)} IMDb
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span className="flex items-center gap-1 font-semibold text-red-300">
                <AnimatedFlame className="w-3.5 h-3.5 text-red-400 fill-red-400" /> {(movie.vote_average * 10).toFixed(0)}%
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span className="font-semibold">
                {movie.release_date?.slice(0, 4)}
              </span>
            </motion.div>
          </AnimatePresence>
          
          <AnimatePresence mode="wait">
            <motion.p 
              key={movie.id + "overview"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden xs:block text-xs text-slate-300 line-clamp-1 sm:line-clamp-2 max-w-lg"
            >
              {movie.overview}
            </motion.p>
          </AnimatePresence>

          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMovieId(movie.id);
                  }}
                  aria-label={`Watch ${movie.title || movie.original_title}`}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Watch Now
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    isWatchlisted ? removeFromWatchlist(movie.id) : addToWatchlist(movie.id);
                  }}
                  aria-label={isWatchlisted ? `Remove ${movie.title || movie.original_title} from watchlist` : `Add ${movie.title || movie.original_title} to watchlist`}
                  className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all hover:-translate-y-0.5 border border-white/10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-white"
                >
                  {isWatchlisted ? <Check className="w-4 h-4 text-indigo-400" /> : <Plus className="w-4 h-4" />}
                  {isWatchlisted ? "Added" : "Add"}
                </button>
              </div>
              
              {/* Pagination Dots */}
              <div className="flex gap-1.5 pr-2">
                {topFive.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    aria-label={`Go to featured movie slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-1 focus:ring-white ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
