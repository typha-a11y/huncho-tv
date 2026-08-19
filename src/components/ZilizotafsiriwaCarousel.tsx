import { Play } from "lucide-react";
import { motion } from "motion/react";
import { ZILIZOTAFSIRIWA_CATALOG } from "../data/zilizotafsiriwa";
import { MoviePosterImage } from "./MoviePosterImage";
import { useStore } from "../lib/store";
import { ZilizotafsiriwaMovie } from "../types";

interface ZilizotafsiriwaCarouselProps {
  onViewAll?: () => void;
}

export function ZilizotafsiriwaCarousel({ onViewAll }: ZilizotafsiriwaCarouselProps) {
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
          className="text-purple-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0 ml-1 focus:outline-none focus:ring-2 focus:ring-purple-600 rounded-md"
        >
          View All
        </button>
      </div>

      <div className="snap-x snap-mandatory overflow-x-auto hide-scrollbar flex gap-3.5 px-1 pb-4">
        {ZILIZOTAFSIRIWA_CATALOG.map((movie) => (
          <motion.div
            key={movie.id}
            role="button"
            tabIndex={0}
            aria-label={`Play ${movie.title} translated by ${movie.djName}`}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={() => handlePlayStream(movie)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handlePlayStream(movie);
              }
            }}
            className="snap-start shrink-0 w-[140px] xs:w-[160px] sm:w-[190px] cursor-pointer group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/80 bg-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2"
          >
            <div className="aspect-[2/3] overflow-hidden relative bg-slate-100">
              <MoviePosterImage
                src={movie.posterUrl}
                title={movie.title}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />
              <span className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 px-1 py-[1px] sm:px-1.5 sm:py-0.5 bg-purple-600/90 text-white text-[7px] xs:text-[8px] sm:text-[9px] font-bold rounded-xs sm:rounded-md shadow-xs uppercase tracking-tight max-w-[85%] truncate z-10 pointer-events-none">
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
