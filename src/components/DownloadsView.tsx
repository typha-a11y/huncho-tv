import { useState } from "react";
import { 
  Download, 
  HardDrive, 
  Play, 
  Trash2, 
  Filter, 
  Film, 
  Sparkles, 
  CheckCircle2, 
  WifiOff, 
  FolderDown,
  PlayCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../lib/store";
import { getImageUrl } from "../lib/api";
import { UserDownloadItem } from "../types";

interface DownloadsViewProps {
  onExplore?: () => void;
}

export function DownloadsView({ onExplore }: DownloadsViewProps) {
  const { downloads, removeDownload, setVideoPlayerOpen } = useStore();
  const [filterTab, setFilterTab] = useState<"All Downloads" | "Local Files" | "Received">("All Downloads");

  // Filter downloads according to active chip
  const filteredDownloads = downloads.filter((item) => {
    if (filterTab === "All Downloads") return true;
    return item.source_type === filterTab;
  });

  const handlePlayDownload = (item: UserDownloadItem) => {
    setVideoPlayerOpen(true, item.download_url);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-6 px-4 space-y-5 text-slate-900">
      {/* 1. Header Storage Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                My Offline Downloads
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {downloads.length} title{downloads.length === 1 ? "" : "s"} saved on device • Watch anywhere without internet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 self-start sm:self-auto">
            <WifiOff className="w-4 h-4 text-emerald-600" />
            <span>8.3 GB Available</span>
          </div>
        </div>

        {/* Visual Storage Meter Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
            <div className="bg-indigo-600 h-full w-[22%]" title="HUNCHO TV Downloads" />
            <div className="bg-sky-400 h-full w-[14%]" title="System & Other Apps" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold px-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
              HUNCHO Downloads (1.7 GB)
            </span>
            <span>8.3 GB Free of 128 GB</span>
          </div>
        </div>
      </div>

      {/* 2. Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1">
        {(["All Downloads", "Local Files", "Received"] as const).map((chip) => {
          const isActive = filterTab === chip;
          return (
            <button
              key={chip}
              onClick={() => setFilterTab(chip)}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer select-none ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {/* 3. Downloaded List Cards or Empty State */}
      {filteredDownloads.length > 0 ? (
        <div className="space-y-3">
          <AnimatePresence>
            {filteredDownloads.map((item) => {
              const posterSrc = item.poster_path?.startsWith("/")
                ? getImageUrl(item.poster_path, "w500")
                : item.poster_path || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80";

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-sm hover:border-indigo-100 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Thumbnail preview with overlay duration badge */}
                    <div className="relative shrink-0 w-20 sm:w-24 h-28 rounded-xl overflow-hidden bg-slate-100 shadow-xs group">
                      <img
                        src={posterSrc}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {item.duration && (
                        <div className="absolute bottom-1 right-1 bg-slate-900/80 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          {item.duration}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-900/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <PlayCircle className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                    </div>

                    {/* Metadata & Title */}
                    <div className="min-w-0 space-y-1.5">
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                        {item.title}
                      </h3>

                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md text-[10px]">
                          {item.quality}
                        </span>
                        <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[10px]">
                          {item.file_size}
                        </span>
                        {item.source_type && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            {item.source_type}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-400 font-medium">
                        Downloaded {new Date(item.downloaded_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      onClick={() => handlePlayDownload(item)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play Now</span>
                    </button>

                    <button
                      onClick={() => removeDownload(item.id)}
                      className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Remove download"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* Empty state */
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-100 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center">
            <FolderDown className="w-8 h-8" />
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-extrabold text-base text-slate-900">
              No Downloaded Titles Yet
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Movies and series you download will appear here for offline viewing without using internet data.
            </p>
          </div>

          {onExplore && (
            <button
              onClick={onExplore}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
            >
              Explore Trending Movies
            </button>
          )}
        </div>
      )}
    </div>
  );
}
