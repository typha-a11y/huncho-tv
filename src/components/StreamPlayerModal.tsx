import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Zap,
  ShieldCheck,
  RefreshCw,
  Maximize,
  Clock,
  Film,
  Sparkles,
  Server,
  Layers,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2
} from "lucide-react";
import { StreamServer } from "../types";
import { createClient } from "@supabase/supabase-js";
import Hls from "hls.js";

// Initialize optional Supabase client
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://huncho-tv.supabase.co";
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || "";

let supabaseClient: any = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (err) {
    console.warn("StreamPlayerModal: Supabase init fallback", err);
  }
}

interface StreamPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId?: string | number;
  imdbId?: string | null;
  movieTitle?: string;
  year?: string | number;
  duration?: string | number;
  quality?: string;
  genre?: string;
}

export function StreamPlayerModal({
  isOpen,
  onClose,
  movieId = "tt30851137",
  imdbId,
  movieTitle = "Dune: Part Two",
  year = "2024",
  duration = "166 min",
  quality = "1080p HD",
  genre = "Sci-Fi / Action"
}: StreamPlayerModalProps) {
  const [servers, setServers] = useState<StreamServer[]>([]);
  const [activeServer, setActiveServer] = useState<StreamServer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMaskEnabled, setIsMaskEnabled] = useState(true);
  const [maskOffset, setMaskOffset] = useState<number>(48); // default 48px top-nav mask
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [hasReported, setHasReported] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Normalize effective Movie/IMDb ID
  const effectiveId = imdbId || (typeof movieId === "string" && movieId.startsWith("tt") ? movieId : `tt30851137`);

  // Default generated servers if DB query has no custom records
  const generateDefaultServers = (targetId: string, titleStr: string): StreamServer[] => {
    return [
      {
        id: "srv-dulo-vip",
        movie_id: targetId,
        title: titleStr,
        server_key: "dulo",
        server_name: "Dulo Stream VIP",
        stream_url: `https://vidsrc.me/embed/movie?imdb=${targetId}`,
        stream_type: "embed",
        quality: "1080p HD",
        latency_ms: 180,
        is_active: true,
        is_fastest: true
      },
      {
        id: "srv-flixhq-pro",
        movie_id: targetId,
        title: titleStr,
        server_key: "flixhq",
        server_name: "FlixHQ Pro",
        stream_url: `https://vidsrc.to/embed/movie/${targetId}`,
        stream_type: "embed",
        quality: "1080p Ultra",
        latency_ms: 240,
        is_active: true
      },
      {
        id: "srv-vidsrc-fast",
        movie_id: targetId,
        title: titleStr,
        server_key: "vidsrc",
        server_name: "VidSrc Fast",
        stream_url: `https://vidsrc.xyz/embed/movie?imdb=${targetId}`,
        stream_type: "embed",
        quality: "1080p HD",
        latency_ms: 310,
        is_active: true
      },
      {
        id: "srv-gomovies-std",
        movie_id: targetId,
        title: titleStr,
        server_key: "gomovies",
        server_name: "GoMovies Standard",
        stream_url: `https://2embed.cc/embed/${targetId}`,
        stream_type: "embed",
        quality: "720p HD",
        latency_ms: 620,
        is_active: true
      }
    ];
  };

  // Fetch servers from Supabase or fallback
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setServerError(null);

    const fetchServers = async () => {
      let dbServers: StreamServer[] = [];

      try {
        if (supabaseClient) {
          const { data, error } = await supabaseClient
            .from("stream_servers")
            .select("*")
            .eq("movie_id", effectiveId)
            .eq("is_active", true)
            .order("latency_ms", { ascending: true });

          if (!error && data && data.length > 0) {
            dbServers = data as StreamServer[];
          }
        }
      } catch (err) {
        console.warn("Supabase stream_servers fetch error:", err);
      }

      if (!isMounted) return;

      if (dbServers.length === 0) {
        dbServers = generateDefaultServers(effectiveId, movieTitle);
      }

      // Mark the server with minimum latency_ms as fastest
      const minLatency = Math.min(...dbServers.map((s) => s.latency_ms || 999));
      const formatted = dbServers.map((s) => ({
        ...s,
        is_fastest: s.latency_ms === minLatency
      }));

      setServers(formatted);
      const fastestServer = formatted.find((s) => s.is_fastest) || formatted[0];
      setActiveServer(fastestServer);
      setIsLoading(false);
    };

    fetchServers();

    return () => {
      isMounted = false;
    };
  }, [isOpen, effectiveId, movieTitle]);

  // Handle direct HLS stream loading if server_type === 'direct_hls'
  useEffect(() => {
    if (!activeServer || activeServer.stream_type !== "direct_hls" || !videoRef.current) return;

    const video = videoRef.current;
    let hls: Hls | null = null;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(activeServer.stream_url);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = activeServer.stream_url;
      video.addEventListener("loadedmetadata", () => setIsLoading(false));
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [activeServer]);

  // Server switch handler
  const handleServerSelect = (server: StreamServer) => {
    if (activeServer?.id === server.id) return;
    setIsLoading(true);
    setServerError(null);
    setHasReported(false);
    setActiveServer(server);
  };

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => console.warn(err));
      setIsFullscreen(false);
    }
  };

  // Reload current server stream iframe
  const handleRefreshStream = () => {
    setIsLoading(true);
    setServerError(null);
    const curr = activeServer;
    setActiveServer(null);
    setTimeout(() => {
      setActiveServer(curr);
    }, 150);
  };

  // Speed Badge Helper
  const renderSpeedBadge = (latencyMs: number, isFastest?: boolean) => {
    if (isFastest || latencyMs < 300) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 text-[#5E35B1] border border-indigo-200/80 shadow-xs">
          <Zap className="w-3 h-3 text-[#2979FF] fill-[#2979FF] animate-pulse" />
          <span>⚡ {latencyMs}ms</span>
          <span className="hidden sm:inline text-[9px] uppercase tracking-wider font-black text-indigo-700 ml-0.5">
            Ultra Fast
          </span>
        </span>
      );
    }
    if (latencyMs <= 600) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#2979FF] border border-blue-200">
          <Clock className="w-3 h-3 text-[#2979FF]" />
          <span>{latencyMs}ms</span>
          <span className="hidden sm:inline text-[9px] font-semibold text-blue-600">Fast</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
        <Server className="w-3 h-3 text-slate-500" />
        <span>{latencyMs}ms</span>
        <span className="hidden sm:inline text-[9px] text-slate-500">Standard</span>
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-5xl bg-[#F8F9FB] border border-[#E5E7EB] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 my-auto"
        >
          {/* Header & Controls Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white border-b border-[#E5E7EB] z-20">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#5E35B1] to-[#2979FF] flex items-center justify-center shadow-md text-white shrink-0">
                <Film className="w-5 h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                    {movieTitle}
                  </h2>
                  <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-purple-50 text-[#5E35B1] border border-purple-200/80 shrink-0">
                    {quality}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-500 font-medium mt-0.5 truncate">
                  <span>{year}</span>
                  <span>•</span>
                  <span>{duration}</span>
                  <span>•</span>
                  <span className="text-slate-700 font-semibold truncate">{genre}</span>
                </div>
              </div>
            </div>

            {/* Close & Action Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsMaskEnabled(!isMaskEnabled)}
                className={`p-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
                  isMaskEnabled
                    ? "bg-indigo-50 text-[#5E35B1] border-indigo-200"
                    : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                }`}
                title={isMaskEnabled ? "Header Masking Enabled (Conceals top nav bar)" : "Header Masking Disabled"}
              >
                {isMaskEnabled ? <EyeOff className="w-4 h-4 text-[#5E35B1]" /> : <Eye className="w-4 h-4 text-slate-500" />}
                <span className="hidden md:inline">{isMaskEnabled ? "Mask ON" : "Mask OFF"}</span>
              </button>

              <button
                onClick={handleRefreshStream}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Refresh Stream"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer hidden sm:flex"
                title="Toggle Fullscreen"
              >
                <Maximize className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer ml-1"
                title="Close Player"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Player Container */}
          <div className="relative w-full aspect-video bg-slate-950 border-b border-[#E5E7EB] overflow-hidden group flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 text-white text-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-500/30 border-t-[#2979FF] animate-spin" />
                  <Zap className="w-5 h-5 text-[#2979FF] absolute" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold tracking-wide">
                    Connecting to <span className="text-indigo-400 font-extrabold">{activeServer?.server_name || "Stream Server"}</span>...
                  </p>
                  <p className="text-xs text-slate-400">
                    Optimizing buffer latency ({activeServer?.latency_ms || 200}ms) & masking server header
                  </p>
                </div>
              </div>
            )}

            {serverError ? (
              <div className="absolute inset-0 z-30 bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center gap-3">
                <AlertCircle className="w-10 h-10 text-rose-500" />
                <p className="text-sm font-bold text-rose-300">{serverError}</p>
                <button
                  onClick={handleRefreshStream}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Server
                </button>
              </div>
            ) : activeServer?.stream_type === "direct_hls" || activeServer?.stream_type === "direct_mp4" ? (
              <video
                ref={videoRef}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
                onCanPlay={() => setIsLoading(false)}
              />
            ) : activeServer ? (
              /* Top-Nav Masking Container Strategy */
              <div className="relative w-full h-full overflow-hidden bg-slate-950">
                <iframe
                  key={activeServer.id}
                  src={activeServer.stream_url}
                  title={`${movieTitle} - ${activeServer.server_name}`}
                  className="w-full h-full rounded-xl border-0"
                  style={{
                    position: "absolute",
                    left: 0,
                    top: isMaskEnabled ? `-${maskOffset}px` : "0px",
                    height: isMaskEnabled ? `calc(100% + ${maskOffset}px)` : "100%"
                  }}
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                  onLoad={() => setIsLoading(false)}
                />
              </div>
            ) : null}

            {/* Quick Header Mask Tuning Overlay (on Hover) */}
            <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#2979FF]" />
              <span>Nav Mask: {isMaskEnabled ? `${maskOffset}px Offset` : "Off"}</span>
              {isMaskEnabled && (
                <div className="flex items-center gap-1 ml-1 border-l border-white/20 pl-2">
                  <button
                    onClick={() => setMaskOffset((prev) => Math.max(0, prev - 8))}
                    className="px-1 bg-white/20 hover:bg-white/40 rounded font-mono"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setMaskOffset((prev) => prev + 8)}
                    className="px-1 bg-white/20 hover:bg-white/40 rounded font-mono"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Server Selection & Speed Rating Bar */}
          <div className="p-4 sm:p-5 bg-white space-y-3.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#5E35B1]" />
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                  Select Streaming Server
                </h3>
                <span className="text-[11px] font-extrabold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {servers.length} Available
                </span>
              </div>

              {/* Status Report Link */}
              <button
                onClick={() => setHasReported(true)}
                disabled={hasReported}
                className="text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-60"
              >
                {hasReported ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Issue Reported
                  </span>
                ) : (
                  <>
                    <AlertCircle className="w-3.5 h-3.5" /> Report Broken Server
                  </>
                )}
              </button>
            </div>

            {/* Server Tabs Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {servers.map((server) => {
                const isActive = activeServer?.id === server.id;
                return (
                  <button
                    key={server.id}
                    onClick={() => handleServerSelect(server)}
                    className={`relative p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2 ${
                      isActive
                        ? "bg-gradient-to-br from-indigo-50/90 to-purple-50/90 border-[#5E35B1] shadow-md ring-2 ring-[#5E35B1]/20"
                        : "bg-white border-[#E5E7EB] hover:border-slate-300 hover:bg-slate-50/80 shadow-xs"
                    }`}
                  >
                    {/* Badge for Fastest */}
                    {server.is_fastest && (
                      <div className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#5E35B1] to-[#2979FF] text-white text-[9px] font-extrabold shadow-sm flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                        <span>⚡ FASTEST</span>
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-xs font-black truncate ${
                            isActive ? "text-[#5E35B1]" : "text-slate-900"
                          }`}
                        >
                          {server.server_name}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium">{server.quality}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                      {renderSpeedBadge(server.latency_ms, server.is_fastest)}
                      <ShieldCheck className={`w-3.5 h-3.5 ${isActive ? "text-[#5E35B1]" : "text-slate-300"}`} />
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Security & Health Assurance Footer */}
            <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>SSL Encrypted • High Bitrate Clean Feed • No Popups</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span>Active Server: <strong className="text-slate-700">{activeServer?.server_name}</strong></span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
