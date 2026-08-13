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
  CheckCircle2,
  Info
} from "lucide-react";
import { StreamServer } from "../types";
import { createClient } from "@supabase/supabase-js";
import Hls from "hls.js";

// Backend API Base URL
const RENDER_BACKEND_URL = "https://huncho-tv-backend.onrender.com";
const BACKEND_API_BASE_URL = RENDER_BACKEND_URL;

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
  isLiveStream?: boolean;
  channelSlug?: string;
  directStreamUrl?: string;
  streamType?: string;
}

export function StreamPlayerModal({
  isOpen,
  onClose,
  movieId = "tt30851137",
  imdbId,
  movieTitle = "Minions & Monsters",
  year = "2026",
  duration = "90 min",
  quality = "1080p HD",
  genre = "Adventure",
  isLiveStream = false,
  channelSlug,
  directStreamUrl,
  streamType = "direct_hls"
}: StreamPlayerModalProps) {
  const [servers, setServers] = useState<StreamServer[]>([]);
  const [activeServer, setActiveServer] = useState<StreamServer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMaskEnabled, setIsMaskEnabled] = useState(true);
  const [maskOffset, setMaskOffset] = useState<number>(48); // default 48px top-nav mask
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [hasReported, setHasReported] = useState(false);
  const [isInterceptorActive, setIsInterceptorActive] = useState(true);
  const [showHint, setShowHint] = useState(false);

  // Auto-dismiss Huncho Hint after 6 seconds
  useEffect(() => {
    if (isOpen) {
      setShowHint(true);
      const timer = setTimeout(() => {
        setShowHint(false);
      }, 6000);
      return () => clearTimeout(timer);
    } else {
      setShowHint(false);
    }
  }, [isOpen, activeServer?.id]);

  // Global popup interceptor overriding window.open while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOpen = window.open;
    window.open = (...args: any[]) => {
      console.log("Blocked popup redirect");
      return null;
    };

    return () => {
      window.open = originalOpen;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setIsInterceptorActive(true);
    }
  }, [isOpen, activeServer?.id]);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Normalize effective Movie/IMDb ID
  const effectiveId = imdbId || (typeof movieId === "string" && movieId.startsWith("tt") ? movieId : `tt30851137`);

  // Helper check for Direct HLS stream
  const isDirectHls = Boolean(
    isLiveStream ||
    (activeServer &&
      (activeServer.stream_type === "direct_hls" ||
        activeServer.stream_type === "direct_mp4" ||
        activeServer.stream_url?.includes(".m3u8") ||
        activeServer.stream_url?.includes("/api/v1/proxy-hls") ||
        activeServer.stream_url?.includes("/api/v1/resolve-live")))
  );

  // Default generated servers with GoMovies Standard FIRST as requested
  const generateDefaultServers = (targetId: string, titleStr: string): StreamServer[] => {
    return [
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
        is_active: true,
        is_fastest: true
      },
      {
        id: "srv-[#2979FF]-render-hls",
        movie_id: targetId,
        title: titleStr,
        server_key: "render_hls",
        server_name: "Render Direct HLS Stream",
        stream_url: `${RENDER_BACKEND_URL}/api/v1/proxy-hls?imdb_id=${targetId}`,
        stream_type: "direct_hls",
        quality: "1080p HD",
        latency_ms: 120,
        is_active: true
      },
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
        is_active: true
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
      }
    ];
  };

  // Fetch servers from Render backend API, Supabase, or fallback
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setIsLoading(true);
    setServerError(null);

    const fetchServers = async () => {
      // Direct Live Stream Adapter Flow
      if (isLiveStream) {
        const targetSlug = channelSlug || (typeof movieId === "string" ? movieId : "espn-hd");
        let resolvedUrl = directStreamUrl || `${BACKEND_API_BASE_URL}/api/v1/proxy-hls?imdb_id=${targetSlug}`;

        try {
          const liveRes = await fetch(`${BACKEND_API_BASE_URL}/api/v1/resolve-live?channel=${encodeURIComponent(targetSlug)}`);
          if (liveRes.ok) {
            const liveData = await liveRes.json();
            if (liveData?.stream_url) {
              resolvedUrl = liveData.stream_url;
            } else if (liveData?.hls_url) {
              resolvedUrl = liveData.hls_url;
            } else if (liveData?.url) {
              resolvedUrl = liveData.url;
            } else if (liveData?.proxy_url) {
              resolvedUrl = liveData.proxy_url;
            }
          }
        } catch (err) {
          console.warn("Resolve live stream error, falling back to proxy URL:", err);
        }

        if (resolvedUrl.startsWith("/")) {
          resolvedUrl = `${BACKEND_API_BASE_URL}${resolvedUrl}`;
        }

        const liveServer: StreamServer = {
          id: `srv-live-${targetSlug}`,
          movie_id: targetSlug,
          title: movieTitle,
          server_key: "live_hls",
          server_name: "Huncho Live HLS Gateway",
          stream_url: resolvedUrl,
          stream_type: (streamType as any) || "direct_hls",
          quality: "1080p 60fps",
          latency_ms: 60,
          is_active: true,
          is_fastest: true
        };

        if (!isMounted) return;
        setServers([liveServer]);
        setActiveServer(liveServer);
        setIsLoading(false);
        return;
      }

      let fetchedServers: StreamServer[] = [];

      // Try fetching from live Render backend API first
      try {
        const renderRes = await fetch(`${BACKEND_API_BASE_URL}/api/v1/stream-servers?movie_id=${effectiveId}`);
        if (renderRes.ok) {
          const data = await renderRes.json();
          if (Array.isArray(data) && data.length > 0) {
            fetchedServers = data;
          } else if (data?.servers && Array.isArray(data.servers) && data.servers.length > 0) {
            fetchedServers = data.servers;
          }
        }
      } catch (err) {
        console.warn("Render production API stream_servers fetch fallback:", err);
      }

      // Try fetching from Supabase if Render backend yielded no custom servers
      if (fetchedServers.length === 0 && supabaseClient) {
        try {
          const { data, error } = await supabaseClient
            .from("stream_servers")
            .select("*")
            .eq("movie_id", effectiveId)
            .eq("is_active", true)
            .order("latency_ms", { ascending: true });

          if (!error && data && data.length > 0) {
            fetchedServers = data as StreamServer[];
          }
        } catch (err) {
          console.warn("Supabase stream_servers fetch error:", err);
        }
      }

      if (!isMounted) return;

      if (fetchedServers.length === 0) {
        fetchedServers = generateDefaultServers(effectiveId, movieTitle);
      }

      // Ensure GoMovies Standard is explicitly first in the list
      let reordered = [...fetchedServers];
      const gomoviesIndex = reordered.findIndex(
        (s) => s.server_key === "gomovies" || s.server_name.toLowerCase().includes("gomovies") || s.latency_ms === 620
      );
      if (gomoviesIndex > 0) {
        const [gomoviesServer] = reordered.splice(gomoviesIndex, 1);
        reordered.unshift(gomoviesServer);
      }

      const formatted = reordered.map((s, idx) => {
        let fullStreamUrl = s.stream_url;
        if (fullStreamUrl && fullStreamUrl.startsWith("/")) {
          fullStreamUrl = `${BACKEND_API_BASE_URL}${fullStreamUrl}`;
        }
        return {
          ...s,
          stream_url: fullStreamUrl,
          is_fastest: idx === 0 // GoMovies Standard gets FASTEST badge
        };
      });

      setServers(formatted);
      setActiveServer(formatted[0]); // Default selected to GoMovies Standard
      setIsLoading(false);
    };

    fetchServers();

    return () => {
      isMounted = false;
    };
  }, [isOpen, effectiveId, movieTitle]);

  // Handle Direct HLS stream loading using Hls.js
  useEffect(() => {
    if (!activeServer || !isDirectHls || !videoRef.current) return;

    const video = videoRef.current;
    let hls: Hls | null = null;

    const fullUrl = activeServer.stream_url.startsWith("/")
      ? `${BACKEND_API_BASE_URL}${activeServer.stream_url}`
      : activeServer.stream_url;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(fullUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        video.play().catch(() => {});
      });
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn("HLS.js fatal playback error:", data);
          setIsLoading(false);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = fullUrl;
      video.addEventListener("loadedmetadata", () => {
        setIsLoading(false);
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [activeServer, isDirectHls]);

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

  // Reload current server stream
  const handleRefreshStream = () => {
    setIsLoading(true);
    setServerError(null);
    const curr = activeServer;
    setActiveServer(null);
    setTimeout(() => {
      setActiveServer(curr);
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="relative w-full max-w-4xl bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 my-auto"
        >
          {/* Mobile-Polished Header Bar */}
          <div className="flex items-center justify-between px-3.5 py-3 sm:px-5 sm:py-3.5 bg-white border-b border-slate-100 z-20">
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2979FF] flex items-center justify-center text-white shrink-0 shadow-xs">
                <Film className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate">
                    {movieTitle}
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100/80 text-[#5E35B1] border border-purple-200/60 shrink-0">
                    {quality}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium mt-0.5 truncate">
                  <span>{year}</span>
                  <span>•</span>
                  <span>{duration}</span>
                  <span>•</span>
                  <span className="truncate">{genre}</span>
                </div>
              </div>
            </div>

            {/* Vertically Centered Refresh & Close Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleRefreshStream}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer flex items-center justify-center"
                title="Refresh Stream"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer flex items-center justify-center"
                title="Close Player"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Video Player Area */}
          <div className="relative w-full aspect-video bg-slate-950 border-b border-slate-100 overflow-hidden group flex items-center justify-center">
            {isLoading && (
              <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 p-6 text-white text-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-3 border-indigo-500/30 border-t-[#2979FF] animate-spin" />
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-[#2979FF] absolute" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold tracking-wide">
                    Connecting to <span className="text-indigo-400 font-extrabold">{activeServer?.server_name || "Stream Server"}</span>...
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Optimizing stream latency ({activeServer?.latency_ms || 620}ms)
                  </p>
                </div>
              </div>
            )}

            {serverError ? (
              <div className="absolute inset-0 z-30 bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center gap-3">
                <AlertCircle className="w-9 h-9 text-rose-500" />
                <p className="text-xs sm:text-sm font-bold text-rose-300">{serverError}</p>
                <button
                  onClick={handleRefreshStream}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Retry Server
                </button>
              </div>
            ) : isDirectHls ? (
              /* Native HTML5 HLS Video Player */
              <video
                ref={videoRef}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
                onCanPlay={() => setIsLoading(false)}
              />
            ) : activeServer ? (
              /* Top-Nav Masking Container Strategy for IFrame Embed */
              <div className="relative w-full h-full overflow-hidden bg-slate-950">
                <iframe
                  key={activeServer.id}
                  src={activeServer.stream_url}
                  title={`${movieTitle} - ${activeServer.server_name}`}
                  className="w-full h-full border-0"
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

            {/* Click-Interceptor Overlay Component for Embeds */}
            {isInterceptorActive && !isLoading && !isDirectHls && activeServer?.stream_type === "embed" && (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsInterceptorActive(false);
                }}
                className="absolute inset-0 z-10 bg-slate-950/30 backdrop-blur-[1px] flex flex-col items-center justify-center cursor-pointer group transition-all duration-300 select-none"
              >
                <div className="bg-slate-900/90 border border-emerald-500/40 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 transform group-hover:scale-105 transition-all mx-4">
                  <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                    <ShieldCheck className="w-5 h-5 animate-pulse text-emerald-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-extrabold text-white">Ad & Popup Shield Active</p>
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Protected</span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-medium mt-0.5">Click anywhere to start video</p>
                  </div>
                </div>
              </div>
            )}

            {/* Ad-Blocker Hint Micro Popup ("Huncho Hint") - Drains over 3s */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-3 right-3 z-30 max-w-[250px] sm:max-w-[270px] bg-slate-900/95 backdrop-blur-md border border-amber-500/40 text-white rounded-xl shadow-2xl overflow-hidden p-2.5 text-[10px] leading-tight select-none"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-1 text-amber-400 font-extrabold text-[11px]">
                      <Sparkles className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      <span>Huncho Hint:</span>
                    </div>
                    <button
                      onClick={() => setShowHint(false)}
                      className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="text-slate-200 font-medium pb-1.5">
                    Using an ad blocker is highly encouraged on all servers to ensure an ad-free viewing experience.
                  </p>

                  {/* 6s Auto-close Progress Bar Draining */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: "100%" }}
                      animate={{ width: "0%" }}
                      transition={{ duration: 6, ease: "linear" }}
                      className="h-full bg-amber-400"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Server Selection Section */}
          <div className="p-3.5 sm:p-5 bg-white space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#5E35B1]" />
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
                    Select Streaming Server
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {servers.length} Available
                  </span>
                </div>
              </div>

              {/* Status Report Link */}
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <button
                  onClick={() => setHasReported(true)}
                  disabled={hasReported}
                  className="hover:text-indigo-600 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {hasReported ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Issue Reported
                    </span>
                  ) : (
                    "Report Broken Server"
                  )}
                </button>
              </div>
            </div>

            {/* Server Grid Row - GoMovies Standard listed FIRST with purple active border & FASTEST badge */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
              {servers.map((server) => {
                const isActive = activeServer?.id === server.id;
                return (
                  <button
                    key={server.id}
                    onClick={() => handleServerSelect(server)}
                    className={`relative p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isActive
                        ? "bg-purple-50/50 border-2 border-[#5E35B1] shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                    }`}
                  >
                    {/* Badge for FASTEST */}
                    {server.is_fastest && (
                      <div className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-[#2979FF] text-white text-[9px] font-black shadow-xs flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                        <Zap className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                        <span>FASTEST</span>
                      </div>
                    )}

                    <div className="space-y-0.5 pr-1">
                      <span
                        className={`text-xs font-black block truncate ${
                          isActive ? "text-slate-900" : "text-slate-900"
                        }`}
                      >
                        {server.server_name}
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium">{server.quality}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-[#2979FF]">
                        <Zap className="w-3 h-3 fill-[#2979FF]" />
                        <span>{server.latency_ms}ms</span>
                      </span>

                      <ShieldCheck className={`w-3.5 h-3.5 ${isActive ? "text-[#5E35B1]" : "text-slate-300"}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

