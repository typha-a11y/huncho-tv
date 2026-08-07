import { useState } from "react";
import { Play, Download, Flame, Star, Sparkles, Filter, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ZILIZOTAFSIRIWA_CATALOG } from "../data/zilizotafsiriwa";
import { ZilizotafsiriwaMovie } from "../types";
import { useStore } from "../lib/store";

interface ZilizotafsiriwaViewProps {
  onExplore?: () => void;
}

const DJ_FILTERS = ["All DJs", "DJ Afro", "DJ Murphy", "DJ Mack", "DJ Rufus"];

export function ZilizotafsiriwaView({ onExplore }: ZilizotafsiriwaViewProps) {
  const [selectedDj, setSelectedDj] = useState<string>("All DJs");
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);

  const { setVideoPlayerOpen, addDownload, checkAuthGuard } = useStore();

  const filteredMovies = ZILIZOTAFSIRIWA_CATALOG.filter((movie) => {
    if (selectedDj === "All DJs") return true;
    return movie.djName.toLowerCase() === selectedDj.toLowerCase();
  });

  const handlePlayStream = (movie: ZilizotafsiriwaMovie) => {
    if (!checkAuthGuard("Watch Swahili Dubbed Movie")) return;
    setVideoPlayerOpen(true, movie.streamUrl, `${movie.title} (${movie.djName})`);
  };

  const handleDownloadMovie = (movie: ZilizotafsiriwaMovie) => {
    if (!checkAuthGuard("Download Swahili Dubbed Movie")) return;
    
    // Add to user downloads state
    addDownload({
      id: `dl-${movie.id}-${Date.now()}`,
      movie_id: movie.id,
      title: `${movie.title} [${movie.djName}]`,
      poster_path: movie.posterUrl,
      quality: movie.quality || "720p HD",
      file_size: movie.fileSize || "700 MB",
      download_url: movie.downloadUrl || movie.streamUrl,
      downloaded_at: new Date().toISOString(),
      duration: "1h 45m",
      source_type: "Local Files",
    });

    setDownloadSuccessToast(`Started downloading "${movie.title}" (${movie.djName})`);
    setTimeout(() => {
      setDownloadSuccessToast(null);
    }, 4000);
  };

  const getDjBadgeColor = (djName: string) => {
    switch (djName.toLowerCase()) {
      case "dj afro":
        return "bg-purple-600 text-white shadow-purple-500/30";
      case "dj murphy":
        return "bg-indigo-600 text-white shadow-indigo-500/30";
      case "dj mack":
        return "bg-rose-600 text-white shadow-rose-500/30";
      case "dj rufus":
        return "bg-amber-600 text-white shadow-amber-500/30";
      default:
        return "bg-slate-900 text-white shadow-slate-900/30";
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {downloadSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-700 max-w-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs font-medium leading-snug">{downloadSuccessToast}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 md:p-10 shadow-xl border border-indigo-500/20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
            Zilizotafsiriwa & Sauti ya Kiswahili
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Filamu za Kiswahili za DJ Afro, DJ Murphy & DJ Mack
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tazama au pakua filamu maarufu za action, kung fu na sci-fi zilizotafsiriwa kwa sauti safi ya Kiswahili.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> HD Stream Directly
            </span>
            <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg backdrop-blur-sm">
              <Download className="w-3.5 h-3.5 text-emerald-400" /> Fast Local Downloads
            </span>
          </div>
        </div>
      </div>

      {/* DJ Filter Badges Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Filter DJ:
          </div>
          {DJ_FILTERS.map((dj) => {
            const isActive = selectedDj === dj;
            return (
              <button
                key={dj}
                onClick={() => setSelectedDj(dj)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20 scale-105"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {dj}
              </button>
            );
          })}
        </div>

        <span className="text-xs font-medium text-slate-500">
          Showing <strong className="text-slate-900">{filteredMovies.length}</strong> movies
        </span>
      </div>

      {/* Movie Cards Catalog */}
      {filteredMovies.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 space-y-3">
          <p className="text-slate-600 font-semibold text-sm">Hakuna filamu ya DJ huyu kwa sasa.</p>
          <button
            onClick={() => setSelectedDj("All DJs")}
            className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            Tazama filamu zote (All DJs)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredMovies.map((movie) => (
            <motion.div
              key={movie.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col h-full"
            >
              {/* Thumbnail with DJ Badge */}
              <div className="relative aspect-[2/3] bg-slate-100 overflow-hidden">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 opacity-80 group-hover:opacity-90 transition-opacity" />

                {/* DJ Badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span
                    className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-md shadow-md ${getDjBadgeColor(
                      movie.djName
                    )}`}
                  >
                    {movie.djName}
                  </span>
                </div>

                {/* Quality Badge */}
                <div className="absolute top-2.5 right-2.5">
                  <span className="text-[10px] font-extrabold bg-black/60 text-emerald-400 backdrop-blur-md px-2 py-0.5 rounded border border-emerald-500/30">
                    {movie.quality || "720p"}
                  </span>
                </div>

                {/* Play Overlay Button */}
                <button
                  onClick={() => handlePlayStream(movie)}
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Watch Now"
                >
                  <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 scale-90 group-hover:scale-100 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </button>

                {/* Year & Size at Bottom of Thumbnail */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-200">
                  <span>{movie.releaseYear}</span>
                  <span className="bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-300">
                    {movie.fileSize || "700 MB"}
                  </span>
                </div>
              </div>

              {/* Movie Info Content */}
              <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 group-hover:text-purple-600 transition-colors">
                    {movie.title}
                  </h3>
                  {movie.synopsis && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {movie.synopsis}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => handlePlayStream(movie)}
                    className="flex-1 h-9 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-purple-600/20"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Tazama
                  </button>

                  <button
                    onClick={() => handleDownloadMovie(movie)}
                    className="h-9 w-9 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95 text-slate-700 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
                    title="Download Movie"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
