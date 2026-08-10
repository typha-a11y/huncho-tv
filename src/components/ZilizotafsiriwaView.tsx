import { useState } from "react";
import { Play, Download, Flame, Sparkles, Filter, CheckCircle2, LayoutGrid, Rows3, ChevronRight, UserCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ZILIZOTAFSIRIWA_CATALOG } from "../data/zilizotafsiriwa";
import { ZilizotafsiriwaMovie } from "../types";
import { useStore } from "../lib/store";
import { MoviePosterImage } from "./MoviePosterImage";

interface ZilizotafsiriwaViewProps {
  onExplore?: () => void;
}

const DJ_FILTERS = ["All DJs", "DJ Afro", "DJ Murphy", "DJ Mack", "DJ Rufus"];

const DJ_PROFILES: Record<string, { tag: string; slogan: string; color: string; badgeBg: string }> = {
  "DJ Afro": {
    tag: "Mfalme wa Maelezo ya Action",
    slogan: "Mapambano ya kikatili, risasi, na kung fu kwa Kiswahili safi na cha vicheko",
    color: "from-purple-600 to-indigo-600",
    badgeBg: "bg-purple-600 text-white shadow-purple-500/30",
  },
  "DJ Mack": {
    tag: "Indian & Bollywood Blockbusters",
    slogan: "KGF, Baahubali, RRR na filamu za ajabu za Kihindi zilizotafsiriwa na sauti tamuu",
    color: "from-rose-600 to-amber-600",
    badgeBg: "bg-rose-600 text-white shadow-rose-500/30",
  },
  "DJ Murphy": {
    tag: "Sci-Fi & Cyberpunk Action",
    slogan: "Filamu za kasi za roboti, Mbio za magari, na teknolojia za mbele",
    color: "from-indigo-600 to-cyan-600",
    badgeBg: "bg-indigo-600 text-white shadow-indigo-500/30",
  },
  "DJ Rufus": {
    tag: "Martial Arts & Comedy Classics",
    slogan: "Kung fu za Jackie Chan, ma-ninja, na vicheko visivyo na mwisho",
    color: "from-amber-600 to-orange-600",
    badgeBg: "bg-amber-600 text-white shadow-amber-500/30",
  },
};

export function ZilizotafsiriwaView({ onExplore }: ZilizotafsiriwaViewProps) {
  const [selectedDj, setSelectedDj] = useState<string>("All DJs");
  const [viewMode, setViewMode] = useState<"categories" | "grid">("categories");
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
    return DJ_PROFILES[djName]?.badgeBg || "bg-slate-900 text-white shadow-slate-900/30";
  };

  // Group catalog by DJ for categorical scroll
  const djs = ["DJ Afro", "DJ Mack", "DJ Murphy", "DJ Rufus"];

  return (
    <div className="space-y-8 pb-12">
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
            Filamu za Kiswahili za DJ Afro, DJ Mack, DJ Murphy & DJ Rufus
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Tazama au pakua filamu maarufu za action, kung fu na sci-fi zilizotafsiriwa kwa sauti safi ya Kiswahili na ma-DJ mashuhuri.
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

      {/* DJ Filter Badges & Layout Toggle Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap border-b border-slate-200/80 pb-4">
        {/* DJ Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none max-w-full">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mr-1 shrink-0">
            <Filter className="w-3.5 h-3.5" /> Select DJ:
          </div>
          {DJ_FILTERS.map((dj) => {
            const isActive = selectedDj === dj;
            return (
              <button
                key={dj}
                onClick={() => {
                  setSelectedDj(dj);
                  if (dj !== "All DJs") {
                    setViewMode("grid");
                  } else {
                    setViewMode("categories");
                  }
                }}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer select-none flex items-center gap-1.5 ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/25 scale-105"
                    : "bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700"
                }`}
              >
                {dj === "All DJs" ? (
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
                {dj}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200/60">
          <button
            onClick={() => setViewMode("categories")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "categories"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Categorical Vertical Scroll"
          >
            <Rows3 className="w-3.5 h-3.5" />
            Categories
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid
          </button>
        </div>
      </div>

      {/* Selected DJ Spotlight Header Card (if a single DJ is active) */}
      {selectedDj !== "All DJs" && DJ_PROFILES[selectedDj] && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-2xl bg-gradient-to-r ${DJ_PROFILES[selectedDj].color} text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md">
                {DJ_PROFILES[selectedDj].tag}
              </span>
              <span className="text-xs font-semibold text-white/80">
                {filteredMovies.length} Filamu Zilizopo
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">{selectedDj} Collection</h2>
            <p className="text-xs text-white/90">{DJ_PROFILES[selectedDj].slogan}</p>
          </div>

          <button
            onClick={() => {
              setSelectedDj("All DJs");
              setViewMode("categories");
            }}
            className="text-xs font-bold bg-white text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition-colors shadow-sm cursor-pointer shrink-0"
          >
            Tazama DJs Wote (All)
          </button>
        </motion.div>
      )}

      {/* Mode 1: Categorical Scroll View (When All DJs or Categories View active) */}
      {viewMode === "categories" && selectedDj === "All DJs" ? (
        <div className="space-y-8">
          {/* Section 1: Trending / Hot Swahili Dubs */}
          <section className="pt-2">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2 h-6 bg-gradient-to-b from-amber-500 to-rose-600 rounded-full shrink-0" />
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
                  <h2 className="text-sm xs:text-base sm:text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
                    Hot Swahili Dubs This Week
                  </h2>
                  <span className="text-[10px] xs:text-xs font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase whitespace-nowrap shrink-0">
                    FEATURED
                  </span>
                </div>
              </div>
            </div>

            {/* Horizontal Snap Scroll Carousel */}
            <div className="snap-x snap-mandatory overflow-x-auto hide-scrollbar flex gap-4 px-1 pb-4">
              {ZILIZOTAFSIRIWA_CATALOG.slice(0, 6).map((movie) => (
                <MovieCarouselCard
                  key={`feat-${movie.id}`}
                  movie={movie}
                  onPlay={handlePlayStream}
                  onDownload={handleDownloadMovie}
                  getDjBadgeColor={getDjBadgeColor}
                />
              ))}
            </div>
          </section>

          {/* Vertical Categorical Scroll Sections per DJ */}
          {djs.map((djName) => {
            const djMovies = ZILIZOTAFSIRIWA_CATALOG.filter(
              (m) => m.djName.toLowerCase() === djName.toLowerCase()
            );
            const profile = DJ_PROFILES[djName];
            if (djMovies.length === 0) return null;

            return (
              <section key={djName} className="pt-2">
                <div className="flex items-center justify-between mb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-6 bg-gradient-to-b ${profile?.color || "from-purple-600 to-indigo-600"} rounded-full`} />
                      <h2 className="text-base xs:text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        {djName} Hits
                        {profile?.tag && (
                          <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                            • {profile.tag}
                          </span>
                        )}
                      </h2>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedDj(djName);
                      setViewMode("grid");
                    }}
                    className="text-purple-600 hover:text-purple-800 font-bold text-xs sm:text-sm flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    View All ({djMovies.length})
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Horizontal Scroll Carousel */}
                <div className="snap-x snap-mandatory overflow-x-auto hide-scrollbar flex gap-4 px-1 pb-4">
                  {djMovies.map((movie) => (
                    <MovieCarouselCard
                      key={movie.id}
                      movie={movie}
                      onPlay={handlePlayStream}
                      onDownload={handleDownloadMovie}
                      getDjBadgeColor={getDjBadgeColor}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* Mode 2: Catalog Grid View */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Filtering: <strong className="text-slate-900">{selectedDj}</strong></span>
            <span>{filteredMovies.length} Movies Available</span>
          </div>

          {filteredMovies.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 space-y-3">
              <p className="text-slate-600 font-semibold text-sm">Hakuna filamu ya DJ huyu kwa sasa.</p>
              <button
                onClick={() => {
                  setSelectedDj("All DJs");
                  setViewMode("categories");
                }}
                className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                Tazama filamu zote (All DJs)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredMovies.map((movie) => (
                <MovieGridCard
                  key={movie.id}
                  movie={movie}
                  onPlay={handlePlayStream}
                  onDownload={handleDownloadMovie}
                  getDjBadgeColor={getDjBadgeColor}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Reusable Horizontal Scroll Card
function MovieCarouselCard({
  movie,
  onPlay,
  onDownload,
  getDjBadgeColor,
}: {
  key?: string;
  movie: ZilizotafsiriwaMovie;
  onPlay: (m: ZilizotafsiriwaMovie) => void;
  onDownload: (m: ZilizotafsiriwaMovie) => void;
  getDjBadgeColor: (dj: string) => string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="snap-start shrink-0 w-[150px] xs:w-[170px] sm:w-[200px] bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col h-full group"
    >
      <div className="relative aspect-[2/3] bg-slate-100 overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* DJ Badge */}
        <div className="absolute top-2 left-2">
          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-md ${getDjBadgeColor(movie.djName)}`}>
            {movie.djName}
          </span>
        </div>

        {/* Quality Badge */}
        <div className="absolute top-2 right-2">
          <span className="text-[10px] font-extrabold bg-black/60 text-emerald-400 backdrop-blur-md px-1.5 py-0.5 rounded border border-emerald-500/30">
            {movie.quality || "720p"}
          </span>
        </div>

        {/* Play Overlay Button */}
        <button
          onClick={() => onPlay(movie)}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Watch Now"
        >
          <div className="w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </button>

        {/* Year at Bottom */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-slate-200">
          <span>{movie.releaseYear}</span>
          <span className="bg-slate-900/80 px-1 py-0.5 rounded text-slate-300">
            {movie.fileSize || "700 MB"}
          </span>
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
        <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 group-hover:text-purple-600 transition-colors">
          {movie.title}
        </h4>

        <div className="flex items-center gap-1.5 pt-1">
          <button
            onClick={() => onPlay(movie)}
            className="flex-1 h-8 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm shadow-purple-600/20"
          >
            <Play className="w-3 h-3 fill-current" />
            Tazama
          </button>
          <button
            onClick={() => onDownload(movie)}
            className="h-8 w-8 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95 text-slate-700 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Download Movie"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Reusable Grid Card
function MovieGridCard({
  movie,
  onPlay,
  onDownload,
  getDjBadgeColor,
}: {
  key?: string;
  movie: ZilizotafsiriwaMovie;
  onPlay: (m: ZilizotafsiriwaMovie) => void;
  onDownload: (m: ZilizotafsiriwaMovie) => void;
  getDjBadgeColor: (dj: string) => string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all flex flex-col h-full"
    >
      <div className="relative aspect-[2/3] bg-slate-100 overflow-hidden">
        <MoviePosterImage
          src={movie.posterUrl}
          title={movie.title}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 opacity-80 group-hover:opacity-90 transition-opacity" />

        <div className="absolute top-2.5 left-2.5">
          <span className={`text-[10px] sm:text-xs font-black uppercase px-2.5 py-1 rounded-md shadow-md ${getDjBadgeColor(movie.djName)}`}>
            {movie.djName}
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5">
          <span className="text-[10px] font-extrabold bg-black/60 text-emerald-400 backdrop-blur-md px-2 py-0.5 rounded border border-emerald-500/30">
            {movie.quality || "720p"}
          </span>
        </div>

        <button
          onClick={() => onPlay(movie)}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          title="Watch Now"
        >
          <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/40 scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 fill-current ml-0.5" />
          </div>
        </button>

        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-200">
          <span>{movie.releaseYear}</span>
          <span className="bg-slate-900/80 px-1.5 py-0.5 rounded text-slate-300">
            {movie.fileSize || "700 MB"}
          </span>
        </div>
      </div>

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

        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => onPlay(movie)}
            className="flex-1 h-9 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-purple-600/20"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Tazama
          </button>

          <button
            onClick={() => onDownload(movie)}
            className="h-9 w-9 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95 text-slate-700 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0"
            title="Download Movie"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Standalone Carousel Component for Homepage Embedding
export function ZilizotafsiriwaCarousel({ onViewAll }: { onViewAll: () => void }) {
  const { setVideoPlayerOpen, checkAuthGuard } = useStore();

  const handlePlayStream = (movie: ZilizotafsiriwaMovie) => {
    if (!checkAuthGuard("Watch Swahili Dubbed Movie")) return;
    setVideoPlayerOpen(true, movie.streamUrl, `${movie.title} (${movie.djName})`);
  };

  return (
    <section className="pt-2">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2 h-6 bg-gradient-to-b from-purple-600 to-indigo-600 rounded-full shrink-0" />
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 min-w-0">
            <h2 className="text-sm xs:text-base sm:text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Zilizotafsiriwa <span className="hidden sm:inline">(Swahili Dubbed Hits)</span>
            </h2>
            <span className="text-[10px] xs:text-xs font-black bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full uppercase whitespace-nowrap shrink-0">
              DJ Afro & More
            </span>
          </div>
        </div>
        <button 
          onClick={onViewAll} 
          className="text-purple-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0 ml-1"
        >
          View All
        </button>
      </div>

      <div className="snap-x snap-mandatory overflow-x-auto hide-scrollbar flex gap-3.5 px-1 pb-4">
        {ZILIZOTAFSIRIWA_CATALOG.map((movie, index) => (
          <motion.div
            key={movie.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.3) }}
            whileHover={{ y: -5 }}
            onClick={() => handlePlayStream(movie)}
            className="snap-start shrink-0 w-[140px] xs:w-[160px] sm:w-[190px] cursor-pointer group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-slate-200/80 bg-white transition-all"
          >
            <div className="aspect-[2/3] overflow-hidden relative bg-slate-100">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-purple-600 text-white text-[9px] font-black rounded-md shadow-md uppercase">
                {movie.djName}
              </span>
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-white font-bold">
                <span>{movie.releaseYear}</span>
                <span className="bg-black/60 px-1.5 py-0.5 rounded text-emerald-400 border border-emerald-500/30">
                  {movie.quality || "720p"}
                </span>
              </div>
            </div>
            <div className="p-2.5 space-y-1">
              <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
                {movie.title}
              </h4>
              <p className="text-[10px] text-purple-700 font-semibold flex items-center gap-1">
                <Play className="w-2.5 h-2.5 fill-current" /> Watch in Swahili
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
