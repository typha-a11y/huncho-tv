import { useEffect, useState } from "react";
import { X, Play, Plus, Check, Star, Flame } from "lucide-react";
import { useStore } from "../lib/store";
import { getMovieDetails, getRatings, getImageUrl } from "../lib/api";
import { MovieDetails, Ratings } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { formatTime } from "../lib/utils";

export function MovieDetailModal() {
  const { selectedMovieId, setSelectedMovieId, setVideoPlayerOpen, watchlist, addToWatchlist, removeFromWatchlist } = useStore();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [ratings, setRatings] = useState<Ratings>({ imdb: null, rottenTomatoes: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedMovieId) {
      setLoading(true);
      getMovieDetails(selectedMovieId).then((data) => {
        setMovie(data);
        if (data?.external_ids?.imdb_id) {
          getRatings(data.external_ids.imdb_id).then(setRatings);
        }
        setLoading(false);
      });
    } else {
      setMovie(null);
      setRatings({ imdb: null, rottenTomatoes: null });
    }
  }, [selectedMovieId]);

  if (!selectedMovieId) return null;

  const isWatchlisted = watchlist.includes(selectedMovieId);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-end sm:items-center sm:p-4"
      >
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-full sm:max-w-4xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col relative border border-slate-200"
        >
          {/* Close Button */}
          <button 
            onClick={() => setSelectedMovieId(null)}
            className="absolute top-4 right-4 z-10 p-2 bg-white/20 backdrop-blur-md text-slate-900 rounded-full hover:bg-white/40 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {loading ? (
            <div className="flex-1 flex items-center justify-center p-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : movie ? (
            <div className="overflow-y-auto flex-1">
              {/* Hero Backplate */}
              <div className="relative h-64 sm:h-96 w-full">
                <img 
                  src={getImageUrl(movie.backdrop_path || movie.poster_path, "original")} 
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
              </div>

              <div className="px-6 sm:px-10 -mt-20 relative pb-10">
                <h2 className="text-3xl sm:text-5xl font-black text-slate-900 mb-4">{movie.title || movie.original_title}</h2>
                
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  {movie.runtime > 0 && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold border border-slate-200">
                      {formatTime(movie.runtime * 60)}
                    </span>
                  )}
                  {ratings.imdb && (
                    <span className="px-3 py-1 bg-[#F5C518]/20 text-[#8B7005] rounded-full text-xs font-bold border border-[#F5C518]/30 flex items-center gap-1">
                      <Star className="w-3 h-3 text-[#8B7005] fill-[#8B7005]" /> {ratings.imdb} IMDb
                    </span>
                  )}
                  {ratings.rottenTomatoes && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200 flex items-center gap-1">
                      <Flame className="w-3 h-3 text-red-700 fill-red-700" /> {ratings.rottenTomatoes}
                    </span>
                  )}
                  {movie.genres?.map(g => (
                    <span key={g.id} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-medium border border-slate-200">
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-4 mb-10">
                  <button 
                    onClick={() => {
                      setVideoPlayerOpen(true);
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-transform active:scale-95"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Play Stream
                  </button>
                  <button 
                    onClick={() => isWatchlisted ? removeFromWatchlist(movie.id) : addToWatchlist(movie.id)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-4 rounded-xl font-bold shadow-sm border border-slate-200 transition-colors hover:bg-slate-50"
                  >
                    {isWatchlisted ? <Check className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5" />}
                    Watchlist
                  </button>
                </div>

                {/* Synopsis */}
                <div className="mb-10">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Storyline</h3>
                  <p className="text-slate-600 leading-relaxed font-medium">
                    {movie.overview || "No overview available for this title."}
                  </p>
                </div>

                {/* Cast */}
                {movie.credits?.cast && movie.credits.cast.length > 0 && (
                  <div className="mb-10">
                    <h3 className="text-xl font-bold text-slate-900 mb-4">Top Cast</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                      {movie.credits.cast.slice(0, 10).map(actor => (
                        <div key={actor.id} className="flex-none w-24 text-center">
                          <img 
                            src={getImageUrl(actor.profile_path, "w500")}
                            alt={actor.name}
                            className="w-20 h-20 mx-auto rounded-full object-cover mb-2 shadow-sm border border-slate-200"
                          />
                          <p className="text-sm font-bold text-slate-900 line-clamp-1">{actor.name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">{actor.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-10 text-center text-slate-500 font-medium">Failed to load movie details.</div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
