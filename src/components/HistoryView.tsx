import { motion, AnimatePresence } from "motion/react";
import { Clock, Play, Trash2, ArrowLeft } from "lucide-react";
import { useStore } from "../lib/store";
import { getImageUrl } from "../lib/api";

export function HistoryView({ onExplore }: { onExplore?: () => void }) {
  const { history, removeFromHistory, setSelectedMovieId } = useStore();
  
  const historyItems = Object.values(history).sort((a, b) => b.updatedAt - a.updatedAt);

  if (historyItems.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-16 px-4 flex flex-col items-center text-center max-w-md mx-auto"
      >
        <div className="w-16 h-16 bg-sky-50 border border-sky-100 rounded-3xl flex items-center justify-center text-sky-600 mb-4 shadow-xs">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-1">No Watch History</h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Movies you start watching will appear here so you can easily resume them later.
        </p>
        {onExplore && (
          <button
            onClick={onExplore}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-sky-600 fill-sky-600/20" />
        <h2 className="text-lg sm:text-xl font-bold text-slate-900">Watch History</h2>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {historyItems.map((item) => {
            const progressPercent = item.duration > 0 ? (item.progress / item.duration) * 100 : 0;
            
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setSelectedMovieId(item.id)}
              >
                <div className="w-16 sm:w-20 aspect-[2/3] shrink-0 rounded-lg overflow-hidden bg-slate-100 relative shadow-sm">
                  {item.poster_path ? (
                    <img
                      src={getImageUrl(item.poster_path, "w92")}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                      <Play className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  {/* Progress bar overlay on image */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-900/50">
                    <div 
                      className="h-full bg-indigo-500"
                      style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0 py-1">
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 font-medium">
                      {Math.floor(item.progress / 60)}m / {Math.floor(item.duration / 60)}m
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(item.id);
                  }}
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                  title="Remove from history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
