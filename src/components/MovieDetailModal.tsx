import { useEffect, useState } from "react";
import { ChevronLeft, Play, Plus, Check, Star, Flame, Youtube, X, Share2, Clock, Calendar, UserCheck } from "lucide-react";
import { useStore } from "../lib/store";
import { getMovieDetails, getRatings, getImageUrl, getPrimaryGenre } from "../lib/api";
import { MovieDetails, Ratings } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { formatTime } from "../lib/utils";

export function MovieDetailModal() {
  const { selectedMovieId, setSelectedMovieId, setVideoPlayerOpen, watchlist, addToWatchlist, removeFromWatchlist } = useStore();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [ratings, setRatings] = useState<Ratings>({ imdb: null, rottenTomatoes: null });
  const [loading, setLoading] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleShare = async () => {
    if (!movie) return;
    const shareData = {
      title: movie.title || movie.original_title,
      text: `Watch ${movie.title || movie.original_title} on HunchOTV!`,
      url: window.location.href,
    };

    if (navigator.share && (typeof navigator.canShare === 'function' ? navigator.canShare(shareData) : true)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error)?.name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch((err) => {
      console.error("Clipboard write failed:", err);
    });
  };

  const isWatchlisted = selectedMovieId ? watchlist.includes(selectedMovieId) : false;

  const trailerVideo = movie?.videos?.results?.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  ) || movie?.videos?.results?.find((v) => v.site === "YouTube");

  return (
    <AnimatePresence>
      {selectedMovieId && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed inset-0 z-50 bg-[#F8F9FB] overflow-y-auto overflow-x-hidden"
        >
          {/* Sticky Responsive Header Bar */}
          <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-3 xs:px-4 py-2.5 flex items-center justify-between shadow-xs">
            <button 
              onClick={() => setSelectedMovieId(null)}
              className="flex items-center gap-1.5 p-1.5 xs:px-2.5 xs:py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer text-xs font-semibold"
            >
              <ChevronLeft className="w-5 h-5 text-slate-700" />
              <span className="hidden xs:inline">Back</span>
            </button>

            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[180px] xs:max-w-[240px] sm:max-w-[360px] text-center">
              {movie ? (movie.title || movie.original_title) : "Movie Details"}
            </h1>

            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Share Movie"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </header>

          {loading ? (
            <div className="min-h-[70vh] w-full flex flex-col items-center justify-center p-8 gap-3">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              <p className="text-xs text-slate-500 font-medium">Loading movie details...</p>
            </div>
          ) : movie ? (
            <div className="pb-16 max-w-4xl mx-auto bg-white min-h-[calc(100vh-53px)] shadow-xs border-x border-slate-200/60">
              {/* Hero Trailer / Backdrop */}
              {showTrailer && trailerVideo ? (
                <div className="relative w-full aspect-[16/9] max-h-[460px] bg-black">
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
                    className="absolute top-3 right-3 z-50 p-2 rounded-full bg-black/60 text-white backdrop-blur-md hover:bg-black/80 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] min-h-[220px] max-h-[420px] bg-slate-900 overflow-hidden">
                  <img 
                    src={getImageUrl(movie.backdrop_path || movie.poster_path, "original")} 
                    alt={movie.title}
                    className="object-cover object-top w-full h-full"
                  />
                  <div className="bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent absolute inset-0 z-10" />
                </div>
              )}

              {/* Movie Header Info Overlay Card */}
              <div className="relative z-20 px-4 xs:px-6 -mt-12 sm:-mt-16 mb-6">
                <div className="flex flex-row items-end gap-3.5 sm:gap-5">
                  {/* Poster Thumbnail */}
                  <div className="w-22 xs:w-28 sm:w-36 aspect-[2/3] rounded-2xl overflow-hidden shadow-lg border-2 border-white bg-slate-200 shrink-0 relative">
                    <img
                      src={getImageUrl(movie.poster_path, "w500")}
                      alt={movie.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Title & Key Quick Specs */}
                  <div className="flex-1 pb-1">
                    <h2 className="text-lg xs:text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-1">
                      {movie.title || movie.original_title}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs text-slate-600 font-medium">
                      {movie.release_date && (
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {movie.release_date.slice(0, 4)}
                        </span>
                      )}
                      {movie.runtime > 0 && (
                        <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                          <Clock className="w-3 h-3 text-slate-500" />
                          {formatTime(movie.runtime * 60)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ratings & Genres Badges Row */}
                <div className="flex flex-wrap items-center gap-1.5 xs:gap-2 mt-4">
                  {ratings.imdb && (
                    <span className="bg-amber-50 text-amber-800 border border-amber-200/80 flex items-center gap-1 text-[11px] xs:text-xs font-bold px-2.5 py-1 rounded-lg">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> IMDb {ratings.imdb}
                    </span>
                  )}
                  {ratings.rottenTomatoes && (
                    <span className="bg-rose-50 text-rose-800 border border-rose-200/80 flex items-center gap-1 text-[11px] xs:text-xs font-bold px-2.5 py-1 rounded-lg">
                      <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> {ratings.rottenTomatoes}
                    </span>
                  )}
                  {movie.genres?.map(g => (
                    <span key={g.id} className="bg-indigo-50 text-indigo-700 border border-indigo-100/80 text-[11px] xs:text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="px-4 xs:px-6 mb-8 space-y-2.5">
                {/* Full-width Main Play Stream Button */}
                <button 
                  onClick={() => setVideoPlayerOpen(true)}
                  className="w-full h-12 text-sm font-bold rounded-xl flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span>Play Stream</span>
                </button>

                {/* Responsive 3-Column Secondary Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {trailerVideo ? (
                    <button 
                      onClick={() => setShowTrailer(true)}
                      className="h-10 text-xs xs:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 transition-colors cursor-pointer"
                    >
                      <Youtube className="w-4 h-4 text-rose-600" />
                      <span>Trailer</span>
                    </button>
                  ) : (
                    <div className="h-10 text-xs font-medium rounded-xl flex items-center justify-center text-slate-400 bg-slate-50 border border-slate-100 select-none">
                      No Trailer
                    </div>
                  )}

                  <button 
                    onClick={() => isWatchlisted ? removeFromWatchlist(movie.id) : addToWatchlist(movie.id)}
                    className={`h-10 text-xs xs:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 border transition-colors cursor-pointer ${
                      isWatchlisted 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200/80'
                    }`}
                  >
                    {isWatchlisted ? <Check className="w-4 h-4 text-indigo-600" /> : <Plus className="w-4 h-4" />}
                    <span>{isWatchlisted ? "Saved" : "Watchlist"}</span>
                  </button>

                  <button 
                    onClick={handleShare}
                    className={`h-10 text-xs xs:text-sm font-semibold rounded-xl flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      copied 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200/80'
                    }`}
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    <span>{copied ? "Copied!" : "Share"}</span>
                  </button>
                </div>
              </div>

              {/* Storyline Section */}
              <div className="px-4 xs:px-6 mb-8">
                <h3 className="text-base xs:text-lg font-bold text-slate-900 mb-2">Storyline</h3>
                <p className="text-slate-600 text-xs xs:text-sm leading-relaxed p-3.5 xs:p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
                  {movie.overview || "No overview available for this title."}
                </p>
              </div>

              {/* Cast List */}
              {movie.credits?.cast && movie.credits.cast.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-base xs:text-lg font-bold text-slate-900 px-4 xs:px-6 mb-3">Top Cast</h3>
                  <div className="flex gap-3 xs:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 xs:px-6 py-1 hide-scrollbar">
                    {movie.credits.cast.slice(0, 10).map((actor) => (
                      <div key={actor.id} className="flex-none w-18 xs:w-22 text-center snap-start">
                        <div className="w-14 h-14 xs:w-16 xs:h-16 rounded-full overflow-hidden bg-slate-100 border-2 border-indigo-500/20 mx-auto mb-1.5 shadow-xs flex items-center justify-center">
                          {actor.profile_path ? (
                            <img 
                              src={getImageUrl(actor.profile_path, "w500")}
                              alt={actor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserCheck className="w-6 h-6 text-slate-400" />
                          )}
                        </div>
                        <p className="text-[10px] xs:text-xs font-bold text-slate-900 line-clamp-1">{actor.name}</p>
                        <p className="text-[9px] xs:text-[10px] text-slate-500 line-clamp-1">{actor.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Movies */}
              {movie.similar?.results && movie.similar.results.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-base xs:text-lg font-bold text-slate-900 px-4 xs:px-6 mb-3">Similar Movies</h3>
                  <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 xs:px-6 hide-scrollbar">
                    {movie.similar.results.map((similarMovie) => {
                      const genreName = getPrimaryGenre(similarMovie.genre_ids);
                      return (
                        <div 
                          key={similarMovie.id} 
                          className="flex-none snap-start w-[115px] xs:w-[135px] sm:w-[160px] cursor-pointer group"
                          onClick={() => setSelectedMovieId(similarMovie.id)}
                        >
                          <div className="aspect-[2/3] w-full bg-slate-100 rounded-xl overflow-hidden shadow-xs border border-slate-200/60 mb-1.5 relative">
                            <img 
                              src={getImageUrl(similarMovie.poster_path, "w500")}
                              alt={similarMovie.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            {genreName && (
                              <span className="absolute top-1.5 left-1.5 px-1 py-[1px] bg-slate-900/65 backdrop-blur-md text-white text-[7px] font-semibold rounded-[3px] border border-white/20 leading-none">
                                {genreName}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                            {similarMovie.title}
                          </h4>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10 text-center text-slate-500 font-medium">Failed to load movie details.</div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

