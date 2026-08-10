import { useEffect, useState } from "react";
import { 
  X, 
  Download, 
  Magnet, 
  CloudDownload, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  HardDrive, 
  Globe, 
  Database,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Film,
  Bell,
  Clock,
  Check,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "../lib/store";
import { resolveDownloadLinks, recordNotificationRequest, unrestrictDebridLink, SourceProgress } from "../lib/api";
import { DownloadResolverResult, DownloadSource } from "../types";

export function DownloadModal() {
  const { isDownloadModalOpen, downloadTarget, closeDownloadModal, addDownload } = useStore();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<DownloadResolverResult | null>(null);
  const [notified, setNotified] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [debridLoading, setDebridLoading] = useState<string | null>(null);
  const [progress, setProgress] = useState<SourceProgress[]>([
    { source: "Supabase", status: "pending" },
    { source: "YTS", status: "pending" },
    { source: "Web Scraper", status: "pending" },
    { source: "Internet Archive", status: "pending" },
  ]);

  const handleResolve = async () => {
    if (!downloadTarget) return;
    setLoading(true);
    setResult(null);
    setNotified(false);

    const initialProgress: SourceProgress[] = [
      { source: "Supabase", status: "pending" },
      { source: "YTS", status: "pending" },
      { source: "Web Scraper", status: "pending" },
      { source: "Internet Archive", status: "pending" },
    ];
    setProgress(initialProgress);

    try {
      const res = await resolveDownloadLinks(
        downloadTarget.imdbId,
        downloadTarget.title,
        (updatedProgress) => {
          setProgress([...updatedProgress]);
        },
        downloadTarget.year
      );
      setResult(res);

      if (
        res &&
        res.sources &&
        res.sources.length > 0 &&
        (res.activeSourceType === "Supabase" ||
          res.sources.some((s) => s.source.toLowerCase().includes("supabase")))
      ) {
        setProgress((prev) =>
          prev.map((p) =>
            p.source === "Supabase" ? { ...p, status: "found" } : p
          )
        );
      }
    } catch (err) {
      console.error("Error resolving download links:", err);
      setResult({
        title: downloadTarget.title,
        imdbId: downloadTarget.imdbId,
        sources: [],
        activeSourceType: null,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isDownloadModalOpen && downloadTarget) {
      handleResolve();
    }
  }, [isDownloadModalOpen, downloadTarget?.title, downloadTarget?.imdbId]);

  if (!isDownloadModalOpen || !downloadTarget) return null;

  const handleDownloadClick = (source: DownloadSource) => {
    if (!source.url || source.url.trim() === "") return;
    
    // Add to real downloads store
    addDownload({
      id: `dl-${downloadTarget?.movieId}-${Date.now()}`,
      movie_id: downloadTarget?.movieId?.toString() || "0",
      title: downloadTarget?.title || "Unknown Movie",
      poster_path: null,
      quality: source.quality,
      file_size: source.size,
      download_url: source.url,
      downloaded_at: new Date().toISOString(),
      duration: "Unknown", // TMDB API doesn't usually give duration in the light object
      source_type: "Local Files"
    });

    window.open(source.url, "_blank", "noopener,noreferrer");
  };

  const handleUnrestrictMagnet = async (src: DownloadSource) => {
    if (!src.url) return;
    
    // Add to real downloads store
    addDownload({
      id: `dl-${downloadTarget?.movieId}-${Date.now()}`,
      movie_id: downloadTarget?.movieId?.toString() || "0",
      title: downloadTarget?.title || "Unknown Movie",
      poster_path: null,
      quality: src.quality,
      file_size: src.size,
      download_url: src.url,
      downloaded_at: new Date().toISOString(),
      duration: "Unknown",
      source_type: "Cloud"
    });

    setDebridLoading(src.id);
    try {
      const directUrl = await unrestrictDebridLink(src.url);
      if (directUrl) {
        window.open(directUrl, "_blank", "noopener,noreferrer");
      } else {
        // Fallback to standard magnet protocol
        window.open(src.url, "_blank", "noopener,noreferrer");
      }
    } catch {
      window.open(src.url, "_blank", "noopener,noreferrer");
    } finally {
      setDebridLoading(null);
    }
  };

  const handleNotifyMe = async () => {
    setNotified(true);
    await recordNotificationRequest(
      downloadTarget.imdbId,
      downloadTarget.title,
      userEmail.trim() || undefined
    );
  };

  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case "Supabase":
        return <Database className="w-4 h-4 text-indigo-600" />;
      case "Real-Debrid":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "YTS":
        return <Globe className="w-4 h-4 text-emerald-600" />;
      case "Internet Archive":
        return <HardDrive className="w-4 h-4 text-amber-600" />;
      case "Direct Cloud":
        return <CloudDownload className="w-4 h-4 text-indigo-600" />;
      default:
        return <HardDrive className="w-4 h-4 text-slate-600" />;
    }
  };

  const getSourceBadgeStyle = (sourceType: string) => {
    switch (sourceType) {
      case "Supabase":
        return "bg-indigo-50 text-indigo-900 border-indigo-200/80 font-bold";
      case "Real-Debrid":
        return "bg-amber-50 text-amber-900 border-amber-300 font-bold";
      case "YTS":
        return "bg-emerald-50 text-emerald-800 border-emerald-200/80";
      case "Internet Archive":
        return "bg-amber-50 text-amber-800 border-amber-200/80";
      case "Direct Cloud":
        return "bg-indigo-50 text-indigo-800 border-indigo-200/80";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        >
          {/* Top Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900 truncate leading-tight">
                  {downloadTarget.title}
                </h3>
                <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Film className="w-3.5 h-3.5" />
                  <span>Download Link Resolver</span>
                  {downloadTarget.imdbId && (
                    <span className="font-mono text-[10px] bg-slate-200/80 px-1.5 py-0.2 rounded text-slate-700">
                      {downloadTarget.imdbId}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={closeDownloadModal}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Step Progress Bar Header */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Tiered Fallback Architecture
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {loading ? "Resolving sources..." : result?.sources?.length ? "Sources resolved" : "Search completed"}
                </span>
              </div>

              {/* Steps Progress Row */}
              <div className="grid grid-cols-2 xs:grid-cols-4 gap-2 pt-1">
                {progress.map((step) => {
                  let badgeBg = "bg-slate-100 text-slate-500 border-slate-200";
                  let icon = <div className="w-2 h-2 rounded-full bg-slate-300" />;

                  if (step.status === "checking") {
                    badgeBg = "bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold shadow-2xs";
                    icon = <Loader2 className="w-3 h-3 text-indigo-600 animate-spin" />;
                  } else if (step.status === "found") {
                    badgeBg = "bg-emerald-50 text-emerald-700 border-emerald-200/80 font-bold";
                    icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
                  } else if (step.status === "failed") {
                    badgeBg = "bg-slate-100 text-slate-400 border-slate-200 line-through opacity-70";
                    icon = <AlertCircle className="w-3 h-3 text-slate-400" />;
                  }

                  return (
                    <div
                      key={step.source}
                      className={`flex items-center justify-between px-2 py-1.5 rounded-lg border text-[10px] transition-all ${badgeBg}`}
                    >
                      <span className="truncate">{step.source}</span>
                      <span className="shrink-0 ml-1">{icon}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Content Area */}
            {loading ? (
              <div className="py-10 text-center space-y-3">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-full animate-bounce">
                  <CloudDownload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Searching YTS, Direct Web Mirrors & Cloud Storage...
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Checking YTS torrents, direct web movie sites, Internet Archive, and direct storage CDN...
                  </p>
                </div>
              </div>
            ) : result && result.sources.length > 0 ? (
              <div className="space-y-3">
                {/* Active Source Notice Banner */}
                <div className="flex items-center justify-between bg-emerald-50/80 border border-emerald-200/80 rounded-xl px-3.5 py-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-950 font-medium">
                      Resolved via <strong className="font-bold text-emerald-800">{result.activeSourceType}</strong>
                    </span>
                  </div>
                  <span className="bg-emerald-200/80 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                    {result.sources.length} format{result.sources.length > 1 ? "s" : ""} available
                  </span>
                </div>

                {/* List of Available Formats / Sources */}
                <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                  {result.sources.map((src) => {
                    const hasValidUrl = Boolean(src.url && src.url.trim().length > 0);
                    return (
                      <div
                        key={src.id}
                        className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:border-indigo-200 hover:shadow-xs transition-all flex flex-col xs:flex-row xs:items-center justify-between gap-3"
                      >
                        {/* Left Specs */}
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">
                              {src.quality}
                            </span>

                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${getSourceBadgeStyle(src.source)}`}>
                              {getSourceIcon(src.source)}
                              {src.source}
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                            <span>Size: <strong className="text-slate-800">{src.size}</strong></span>
                            {src.format && (
                              <span>Format: <strong className="text-slate-800">{src.format}</strong></span>
                            )}
                            {src.seeds !== undefined && (
                              <span className="text-emerald-600 font-semibold">
                                {src.seeds} seeds / {src.peers} peers
                              </span>
                            )}
                            {src.uploaderName && (
                              <span className="text-indigo-600 font-semibold">
                                Uploaded by {src.uploaderName}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Download Button Action */}
                        <button
                          onClick={() => handleDownloadClick(src)}
                          disabled={!hasValidUrl}
                          className={`shrink-0 h-9 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                            !hasValidUrl
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 opacity-60"
                              : src.type === "magnet"
                              ? "bg-amber-600 hover:bg-amber-700 text-white shadow-xs cursor-pointer"
                              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                          }`}
                        >
                          {src.type === "magnet" ? (
                            <>
                              <Magnet className="w-3.5 h-3.5" />
                              <span>Get Magnet</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </>
                          )}
                          <ExternalLink className="w-3 h-3 opacity-70 ml-0.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* "Movie Link Coming Soon" Empty State when all 3 sources yield no results */
              <div className="py-8 px-5 text-center space-y-4 bg-gradient-to-b from-slate-50 to-indigo-50/30 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div className="inline-flex items-center justify-center p-3.5 bg-amber-100/80 text-amber-700 rounded-2xl shadow-2xs">
                  <Clock className="w-7 h-7" />
                </div>

                <div className="space-y-1.5 max-w-md mx-auto">
                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                    No download links available yet
                  </h4>
                  <p className="text-xs font-medium text-slate-600 leading-relaxed">
                    Download links for this title are currently being updated. Check back shortly!
                  </p>
                </div>

                <div className="pt-1 max-w-sm mx-auto space-y-3">
                  {!notified && (
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="Enter your email (optional)"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500 bg-white text-slate-800"
                    />
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                    <button
                      onClick={handleNotifyMe}
                      disabled={notified}
                      className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
                        notified
                          ? "bg-emerald-600 text-white border border-emerald-700"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700"
                      }`}
                    >
                      {notified ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                          <span>Notification Set!</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-4 h-4 text-white" />
                          <span>Notify Me When Available</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleResolve}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 shadow-2xs transition-all cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      <span>Re-check Resolver</span>
                    </button>
                  </div>
                </div>

                {notified && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-lg px-3 py-1.5 max-w-xs mx-auto"
                  >
                    ✓ We will notify you as soon as verified links are added to HUNCHO TV.
                  </motion.p>
                )}
              </div>
            )}
          </div>

          {/* Footer Note */}
          <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              HUNCHO TV Smart Link Resolver
            </span>
            <button
              onClick={closeDownloadModal}
              className="text-indigo-600 hover:underline font-bold cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
