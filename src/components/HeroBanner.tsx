import { Play, Plus, Check, Star, Flame } from "lucide-react";
import { Movie } from "../types";
import { getImageUrl } from "../lib/api";
import { useStore } from "../lib/store";
import { motion } from "motion/react";

export function HeroBanner({ movie }: { movie: Movie | null }) {
  const { watchlist, addToWatchlist, removeFromWatchlist, setSelectedMovieId } = useStore();
  
  if (!movie) return <div className="w-full h-[60vh] bg-slate-100 animate-pulse rounded-3xl" />;

  const isWatchlisted = watchlist.includes(movie.id);

  return (
    <div className="relative w-full h-[60vh] sm:h-[70vh] rounded-3xl overflow-hidden group shadow-lg">
      <img
        src={getImageUrl(movie.backdrop_path || movie.poster_path, "original")}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Light gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent" />
      
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 flex flex-col md:flex-row gap-6 md:items-end justify-between">
        <div className="max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-4"
          >
            {movie.title || movie.original_title}
          </motion.h1>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 text-sm font-bold text-slate-700 mb-6"
          >
            <span className="px-2.5 py-1 rounded-md bg-white shadow-sm border border-slate-200 flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {movie.vote_average?.toFixed(1)} IMDb
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white shadow-sm border border-slate-200 text-red-600 flex items-center gap-1">
              <Flame className="w-4 h-4 text-red-500 fill-red-500" /> {(movie.vote_average * 10).toFixed(0)}%
            </span>
            <span>•</span>
            <span>{movie.release_date?.slice(0, 4)}</span>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-base sm:text-lg line-clamp-2 md:line-clamp-3 mb-8 max-w-xl font-medium"
          >
            {movie.overview}
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <button 
              onClick={() => setSelectedMovieId(movie.id)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
            >
              <Play className="w-5 h-5 fill-current" />
              Watch Now
            </button>
            <button 
              onClick={() => isWatchlisted ? removeFromWatchlist(movie.id) : addToWatchlist(movie.id)}
              className="flex items-center gap-2 bg-white/80 hover:bg-white backdrop-blur-md text-slate-900 px-6 py-4 rounded-xl font-bold shadow-sm border border-slate-200/60 transition-all hover:-translate-y-0.5"
            >
              {isWatchlisted ? <Check className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5" />}
              {isWatchlisted ? "Added" : "Add to Library"}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
