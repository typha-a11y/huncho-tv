import { useEffect, useState } from "react";
import { ChevronLeft, Play, Plus, Check, Star, Flame, Youtube, X } from "lucide-react";
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
  const [showTrailer, setShowTrailer] = useState(false);

  useEffect(() => {
    if (selectedMovieId) {
      setShowTrailer(false);
      setMovie(null);
      setRatings({ imdb: null, rottenTomatoes: null });
      setLoading(true);
      getMovieDetails(selectedMovieId).then((data) => {
        setMovie(data);
        if (data?.external_ids?.imdb_id) {
          getRatings(data.external_ids.imdb_id).then(setRatings);
        }
        setLoading(false);
      });
    }
  }, [selectedMovieId]);

  const isWatchlisted = selectedMovieId ? watchlist.includes(selectedMovieId) : false;

  const trailerVideo = movie?.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  ) || movie?.videos?.results?.find((v) => v.site === "YouTube");

  return (
    <AnimatePresence>
      {selectedMovieId && (
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          className="fixed inset-0 z-50 bg-[#F8F9FB] overflow-y-auto overflow-x-hidden"
        >
          <button 
            onClick={() => setSelectedMovieId(null)}
            className="absolute top-4 left-4 z-50 p-2.5 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {loading ? (
            <div className="h-full w-full flex items-center justify-center p-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : movie ? (
            <div className="pb-20 max-w-5xl mx-auto bg-white min-h-screen shadow-sm border-x border-slate-200">
              {/* Hero Header Banner */}
              {showTrailer && trailerVideo ? (
                <div className="relative w-full h-[55vh] min-h-[380px] max-h-[520px] bg-black">
                  <iframe
                    className="w-full h-full object-cover"
                    src={`https://www.youtube.com/embed/${trailerVideo.key}?autoplay=1`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <button
                    onClick={() => setShowTrailer(false)}
                    className="absolute top-4 right-4 z-50 p-2.5 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              ) : (
                <div className="relative w-full h-[55vh] min-h-[380px] max-h-[520px]">
                  <img 
                    src={getImageUrl(movie.backdrop_path || movie.poster_path, "original")} 
                    alt={movie.title}
                    className="object-cover object-top w-full h-full"
                  />
                  <div className="bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent absolute inset-0 z-10" />
                  
                  <h2 className="text-2xl xs:text-3xl sm:text-4xl font-black text-white px-4 z-20 absolute bottom-16">
                    {movie.title || movie.original_title}
                  </h2>
                </div>
              )}

              {/* Negative margin to pull up content slightly into the banner area, or just below it. The text title is at bottom-16. */}
              <div className="-mt-12 relative z-20">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 px-4 mb-4 z-20">
                  {movie.runtime > 0 && (
                    <span className="bg-white/10 backdrop-blur-md text-slate-200 text-xs px-3 py-1 rounded-full">
                      {formatTime(movie.runtime * 60)}
                    </span>
                  )}
                  {ratings.imdb && (
                    <span className="bg-[#F5C518]/20 backdrop-blur-md text-[#F5C518] border border-[#F5C518]/30 flex items-center gap-1 text-xs px-3 py-1 rounded-full">
                      <Star className="w-3 h-3 text-[#F5C518] fill-[#F5C518]" /> {ratings.imdb}
                    </span>
                  )}
                  {ratings.rottenTomatoes && (
                    <span className="bg-red-500/20 backdrop-blur-md text-red-400 border border-red-500/30 flex items-center gap-1 text-xs px-3 py-1 rounded-full">
                      <Flame className="w-3 h-3 text-red-400 fill-red-400" /> {ratings.rottenTomatoes}
                    </span>
                  )}
                  {movie.genres?.map(g => (
                    <span key={g.id} className="bg-white/10 backdrop-blur-md text-slate-200 text-xs px-3 py-1 rounded-full">
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Primary Actions */}
                <div className="flex flex-wrap gap-3 px-4 w-full z-20 mb-8">
                  <button 
                    onClick={() => setVideoPlayerOpen(true)}
                    className="h-12 text-sm font-bold rounded-xl flex-[2] min-w-[140px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-transform active:scale-95"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Play Stream
                  </button>
                  {trailerVideo && (
                    <button 
                      onClick={() => setShowTrailer(true)}
                      className="h-12 text-sm font-bold rounded-xl flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20 hover:bg-[#FF0000]/20 transition-colors"
                    >
                      <Youtube className="w-5 h-5" />
                      Trailer
                    </button>
                  )}
                  <button 
                    onClick={() => isWatchlisted ? removeFromWatchlist(movie.id) : addToWatchlist(movie.id)}
                    className="h-12 text-sm font-bold rounded-xl flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-slate-100 text-slate-900 border border-slate-200 transition-colors hover:bg-slate-200"
                  >
                    {isWatchlisted ? <Check className="w-5 h-5 text-indigo-600" /> : <Plus className="w-5 h-5" />}
                    Watchlist
                  </button>
                </div>

                {/* Storyline */}
                <div className="mb-8">
                  <h3 className="text-lg xs:text-xl font-bold text-slate-900 px-4 mb-2">Storyline</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed px-4 py-3 bg-slate-50 mx-4 rounded-2xl border border-slate-100">
                    {movie.overview || "No overview available for this title."}
                  </p>
                </div>

                {/* Top Cast */}
                {movie.credits?.cast && movie.credits.cast.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg xs:text-xl font-bold text-slate-900 px-4 mb-2">Top Cast</h3>
                    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 py-2 hide-scrollbar">
                      {movie.credits.cast.slice(0, 10).map(actor => (
                        <div key={actor.id} className="flex-none w-[72px] xs:w-[88px] text-center snap-start">
                          <img 
                            src={getImageUrl(actor.profile_path, "w500")}
                            alt={actor.name}
                            className="w-16 h-16 xs:w-20 xs:h-20 rounded-full object-cover border-2 border-indigo-500/20 mx-auto mb-2"
                          />
                          <p className="text-[10px] xs:text-xs font-bold text-slate-900 line-clamp-1">{actor.name}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{actor.character}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Similar / Recommended Movies Row */}
                {movie.similar?.results && movie.similar.results.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg xs:text-xl font-bold text-slate-900 px-4 mb-3">Similar Movies</h3>
                    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 hide-scrollbar">
                      {movie.similar.results.map((similarMovie) => (
                        <div 
                          key={similarMovie.id} 
                          className="flex-none snap-start w-[125px] xs:w-[145px] sm:w-[175px]"
                          onClick={() => setSelectedMovieId(similarMovie.id)}
                        >
                          <div className="aspect-[2/3] w-full bg-slate-200 rounded-xl overflow-hidden shadow-sm border border-slate-200/60 mb-2 cursor-pointer">
                            <img 
                              src={getImageUrl(similarMovie.poster_path, "w500")}
                              alt={similarMovie.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <h4 className="text-xs xs:text-sm font-bold text-slate-900 line-clamp-1">{similarMovie.title}</h4>
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
      )}
    </AnimatePresence>
  );
}
