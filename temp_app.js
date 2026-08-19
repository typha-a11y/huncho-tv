import { jsx, jsxs } from "react/jsx-runtime";
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useEffect, useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bookmark, Download, User as UserIcon, Flame, Radio } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { HeroBanner } from "./components/HeroBanner";
import { BentoGrid, CategoryCarousel } from "./components/BentoGrid";
import { ZilizotafsiriwaCarousel } from "./components/ZilizotafsiriwaCarousel";
import { MovieGrid } from "./components/MovieGrid";
import { WatchlistGrid } from "./components/WatchlistGrid";
import { PullToRefresh } from "./components/PullToRefresh";
import { Recommendations } from "./components/Recommendations";
import { RecentlyUploadedSection } from "./components/RecentlyUploadedSection";
import { PwaInstallBanner } from "./components/PwaInstallBanner";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ViewLoadingFallback, ModalLoadingFallback } from "./components/ViewLoadingFallback";
const MovieDetailModal = lazy(() => import("./components/MovieDetailModal").then((m) => ({ default: m.MovieDetailModal })));
const VideoPlayerModal = lazy(() => import("./components/VideoPlayerModal").then((m) => ({ default: m.VideoPlayerModal })));
const StreamPlayerModal = lazy(() => import("./components/StreamPlayerModal").then((m) => ({ default: m.StreamPlayerModal })));
const DownloadModal = lazy(() => import("./components/DownloadModal").then((m) => ({ default: m.DownloadModal })));
const AuthModal = lazy(() => import("./components/AuthModal").then((m) => ({ default: m.AuthModal })));
const ProfileView = lazy(() => import("./components/ProfileView").then((m) => ({ default: m.ProfileView })));
const DownloadsView = lazy(() => import("./components/DownloadsView").then((m) => ({ default: m.DownloadsView })));
const HistoryView = lazy(() => import("./components/HistoryView").then((m) => ({ default: m.HistoryView })));
const ZilizotafsiriwaView = lazy(() => import("./components/ZilizotafsiriwaView").then((m) => ({ default: m.ZilizotafsiriwaView })));
const LiveSportsView = lazy(() => import("./components/LiveSportsView").then((m) => ({ default: m.LiveSportsView })));
const PlansModal = lazy(() => import("./components/PlansModal").then((m) => ({ default: m.PlansModal })));
const SettingsModal = lazy(() => import("./components/SettingsModal").then((m) => ({ default: m.SettingsModal })));
import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getUpcomingMovies,
  getNowPlayingMovies,
  getGenres,
  getMoviesByGenre,
  getCuratedDownloads,
  isTmdbConfigured
} from "./lib/api";
import { cn } from "./lib/utils";
import { useStore } from "./lib/store";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient";
function App() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [nowPlaying, setNowPlaying] = useState([]);
  const [actionMovies, setActionMovies] = useState([]);
  const [animationMovies, setAnimationMovies] = useState([]);
  const [sciFiMovies, setSciFiMovies] = useState([]);
  const [comedyMovies, setComedyMovies] = useState([]);
  const [curatedDownloads, setCuratedDownloads] = useState([]);
  const [genres, setGenres] = useState([]);
  const [heroMovies, setHeroMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("home");
  const { selectedMovieId, watchlist, downloads, user, setUser } = useStore();
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        setUser({
          id: u.id,
          email: u.email || "",
          full_name: u.user_metadata?.full_name || u.email?.split("@")[0] || "User",
          avatar_url: u.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email || "")}`,
          is_pro: true,
          created_at: u.created_at
        });
      }
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        const u = session.user;
        setUser({
          id: u.id,
          email: u.email || "",
          full_name: u.user_metadata?.full_name || u.email?.split("@")[0] || "User",
          avatar_url: u.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email || "")}`,
          is_pro: true,
          created_at: u.created_at
        });
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [setUser]);
  const handleRefresh = async () => {
    try {
      const [
        trendingData,
        popularData,
        topRatedData,
        upcomingData,
        nowPlayingData,
        actionData,
        animData,
        sciFiData,
        comedyData,
        genresData,
        curatedData
      ] = await Promise.all([
        getTrendingMovies(),
        getPopularMovies(),
        getTopRatedMovies(),
        getUpcomingMovies(),
        getNowPlayingMovies(),
        getMoviesByGenre(28, 1),
        getMoviesByGenre(16, 1),
        getMoviesByGenre(878, 1),
        getMoviesByGenre(35, 1),
        getGenres(),
        getCuratedDownloads()
      ]);
      setTrending(trendingData);
      setPopular(popularData);
      setTopRated(topRatedData);
      setUpcoming(upcomingData);
      setNowPlaying(nowPlayingData);
      setActionMovies(actionData);
      setAnimationMovies(animData);
      setSciFiMovies(sciFiData);
      setComedyMovies(comedyData);
      setGenres(genresData);
      setCuratedDownloads(curatedData);
      if (activeTab === "home" || activeTab === "discover") {
        setHeroMovies(trendingData);
      }
    } catch (err) {
      console.error("Failed to refresh movie data:", err);
    }
  };
  useEffect(() => {
    const loadHomeData = () => {
      Promise.all([
        getTrendingMovies(),
        getPopularMovies(),
        getTopRatedMovies(),
        getUpcomingMovies(),
        getNowPlayingMovies(),
        getMoviesByGenre(28, 1),
        getMoviesByGenre(16, 1),
        getMoviesByGenre(878, 1),
        getMoviesByGenre(35, 1),
        getGenres(),
        getCuratedDownloads()
      ]).then(([
        trendingData,
        popularData,
        topRatedData,
        upcomingData,
        nowPlayingData,
        actionData,
        animData,
        sciFiData,
        comedyData,
        genresData,
        curatedData
      ]) => {
        setTrending(trendingData);
        setPopular(popularData);
        setTopRated(topRatedData);
        setUpcoming(upcomingData);
        setNowPlaying(nowPlayingData);
        setActionMovies(actionData);
        setAnimationMovies(animData);
        setSciFiMovies(sciFiData);
        setComedyMovies(comedyData);
        setGenres(genresData);
        setCuratedDownloads(curatedData);
        setHeroMovies(trendingData);
        setLoading(false);
      }).catch((err) => {
        console.warn("Home data auto-refresh error:", err);
      });
    };
    loadHomeData();
    const intervalId = setInterval(loadHomeData, 10 * 60 * 1e3);
    return () => clearInterval(intervalId);
  }, []);
  useEffect(() => {
    if (activeTab === "home" || activeTab === "discover") {
      setHeroMovies(trending);
    } else if (typeof activeTab === "number") {
      getMoviesByGenre(activeTab, 1).then((genreMovies) => {
        if (genreMovies && genreMovies.length > 0) {
          setHeroMovies(genreMovies.slice(0, 10));
        }
      });
    } else if (activeTab === "popular") {
      setHeroMovies(popular);
    } else if (activeTab === "top_rated") {
      setHeroMovies(topRated);
    } else if (activeTab === "upcoming") {
      setHeroMovies(upcoming);
    }
  }, [activeTab, trending, popular, topRated, upcoming]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-[#F8F9FB] flex items-center justify-center", children: /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" }) });
  }
  const trendingGrid = trending.slice(5, 10);
  const activeGenreObj = genres.find((g) => g.id === activeTab);
  const activeGenreName = activeGenreObj?.name;
  const getBadgeText = () => {
    if (activeTab === "home" || activeTab === "discover") return "Trending Now";
    if (activeGenreName) return `Hot in ${activeGenreName}`;
    if (activeTab === "popular") return "Most Popular";
    if (activeTab === "top_rated") return "Top Rated";
    if (activeTab === "upcoming") return "Upcoming Releases";
    return "Top Picks";
  };
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-[#F8F9FB] text-slate-900 font-sans pb-20 overflow-x-hidden", children: [
    /* @__PURE__ */ jsxs(PullToRefresh, { onRefresh: handleRefresh, children: [
      /* @__PURE__ */ jsx(
        Navbar,
        {
          activeTab,
          onSelectDiscover: () => setActiveTab("home"),
          onSelectLiveSports: () => setActiveTab("live-sports"),
          onSelectZilizotafsiriwa: () => setActiveTab("zilizotafsiriwa"),
          onSelectWatchlist: () => setActiveTab("watchlist"),
          onSelectDownloads: () => setActiveTab("downloads"),
          onSelectProfile: () => setActiveTab("profile")
        }
      ),
      /* @__PURE__ */ jsxs("main", { className: cn("w-full mx-auto pt-2 pb-4", activeTab === "profile" ? "px-0 max-w-full" : "max-w-7xl px-4 xs:px-5 sm:px-6 md:px-8"), children: [
        /* @__PURE__ */ jsxs("div", { className: cn("flex items-center gap-2 overflow-x-auto hide-scrollbar py-3 my-2 sticky top-16 z-30 bg-[#F8F9FB]/90 backdrop-blur-md px-1", activeTab === "profile" ? "px-4 sm:px-6 w-full" : ""), children: [
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveTab("home"),
              className: cn(
                "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none shrink-0",
                activeTab === "home" || activeTab === "discover" ? "text-white font-semibold" : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
              ),
              children: [
                (activeTab === "home" || activeTab === "discover") && /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    layoutId: "activeGenrePill",
                    className: "absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/25",
                    transition: { type: "spring", stiffness: 400, damping: 30 }
                  }
                ),
                /* @__PURE__ */ jsx("span", { className: "relative z-10", children: "Discover" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveTab("live-sports"),
              className: cn(
                "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-3.5 py-1.5 outline-none select-none flex items-center gap-1.5 shrink-0",
                activeTab === "live-sports" ? "text-white font-semibold" : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 bg-slate-100/60"
              ),
              children: [
                activeTab === "live-sports" && /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    layoutId: "activeGenrePill",
                    className: "absolute inset-0 bg-emerald-600 rounded-full shadow-md shadow-emerald-500/25 z-0",
                    transition: { type: "spring", stiffness: 400, damping: 30 }
                  }
                ),
                /* @__PURE__ */ jsxs("span", { className: "relative z-10 flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx(Radio, { className: cn("w-3.5 h-3.5 text-emerald-500 shrink-0", activeTab === "live-sports" && "text-white") }),
                  /* @__PURE__ */ jsx("span", { children: "Live Sports & TV" }),
                  /* @__PURE__ */ jsx("span", { className: cn(
                    "text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none tracking-tight",
                    activeTab === "live-sports" ? "bg-amber-400 text-slate-950" : "bg-emerald-100 text-emerald-800"
                  ), children: "\u26A1 SOON" })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveTab("zilizotafsiriwa"),
              className: cn(
                "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-bold text-xs rounded-full px-4 py-1.5 outline-none select-none flex items-center gap-1.5 shrink-0",
                activeTab === "zilizotafsiriwa" ? "text-white font-extrabold" : "text-purple-700 bg-purple-50 hover:bg-purple-100 hover:text-purple-900"
              ),
              children: [
                activeTab === "zilizotafsiriwa" && /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    layoutId: "activeGenrePill",
                    className: "absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-md shadow-purple-500/25",
                    transition: { type: "spring", stiffness: 400, damping: 30 }
                  }
                ),
                /* @__PURE__ */ jsxs("span", { className: "relative z-10 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Flame, { className: "w-3.5 h-3.5 text-amber-400 fill-amber-400" }),
                  "Zilizotafsiriwa",
                  /* @__PURE__ */ jsx("span", { className: cn(
                    "text-[10px] font-black px-1.5 py-0.2 rounded-full ml-0.5",
                    activeTab === "zilizotafsiriwa" ? "bg-amber-400 text-slate-950" : "bg-purple-200 text-purple-900"
                  ), children: "HOT" })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveTab("watchlist"),
              className: cn(
                "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none flex items-center gap-1.5 shrink-0",
                activeTab === "watchlist" ? "text-white font-semibold" : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
              ),
              children: [
                activeTab === "watchlist" && /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    layoutId: "activeGenrePill",
                    className: "absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/25",
                    transition: { type: "spring", stiffness: 400, damping: 30 }
                  }
                ),
                /* @__PURE__ */ jsxs("span", { className: "relative z-10 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Bookmark, { className: "w-3.5 h-3.5" }),
                  "Watchlist",
                  watchlist.length > 0 && /* @__PURE__ */ jsx("span", { className: cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5",
                    activeTab === "watchlist" ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"
                  ), children: watchlist.length })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveTab("downloads"),
              className: cn(
                "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none flex items-center gap-1.5 shrink-0",
                activeTab === "downloads" ? "text-white font-semibold" : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
              ),
              children: [
                activeTab === "downloads" && /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    layoutId: "activeGenrePill",
                    className: "absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/25",
                    transition: { type: "spring", stiffness: 400, damping: 30 }
                  }
                ),
                /* @__PURE__ */ jsxs("span", { className: "relative z-10 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(Download, { className: "w-3.5 h-3.5" }),
                  "Downloads",
                  downloads.length > 0 && /* @__PURE__ */ jsx("span", { className: cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5",
                    activeTab === "downloads" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                  ), children: downloads.length })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "button",
            {
              onClick: () => setActiveTab("profile"),
              className: cn(
                "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none flex items-center gap-1.5 shrink-0",
                activeTab === "profile" ? "text-white font-semibold" : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
              ),
              children: [
                activeTab === "profile" && /* @__PURE__ */ jsx(
                  motion.div,
                  {
                    layoutId: "activeGenrePill",
                    className: "absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/25",
                    transition: { type: "spring", stiffness: 400, damping: 30 }
                  }
                ),
                /* @__PURE__ */ jsxs("span", { className: "relative z-10 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsx(UserIcon, { className: "w-3.5 h-3.5" }),
                  "Profile",
                  user && /* @__PURE__ */ jsx("span", { className: "w-2 h-2 rounded-full bg-emerald-400 inline-block ml-0.5" })
                ] })
              ]
            }
          ),
          genres.map((genre) => {
            const isActive = activeTab === genre.id;
            return /* @__PURE__ */ jsxs(
              "button",
              {
                onClick: () => setActiveTab(genre.id),
                className: cn(
                  "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none shrink-0",
                  isActive ? "text-white font-semibold" : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
                ),
                children: [
                  isActive && /* @__PURE__ */ jsx(
                    motion.div,
                    {
                      layoutId: "activeGenrePill",
                      className: "absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/25",
                      transition: { type: "spring", stiffness: 400, damping: 30 }
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "relative z-10", children: genre.name })
                ]
              },
              genre.id
            );
          })
        ] }),
        /* @__PURE__ */ jsx(AnimatePresence, { mode: "wait", children: activeTab === "live-sports" ? /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -12 },
            transition: { duration: 0.25, ease: "easeOut" },
            children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(ViewLoadingFallback, { message: "Inapakia Michezo na TV..." }), children: /* @__PURE__ */ jsx(LiveSportsView, { onExplore: () => setActiveTab("home") }) })
          },
          "live-sports"
        ) : activeTab === "zilizotafsiriwa" ? /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -12 },
            transition: { duration: 0.25, ease: "easeOut" },
            children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(ViewLoadingFallback, { message: "Inapakia Filamu Zilizotafsiriwa..." }), children: /* @__PURE__ */ jsx(ZilizotafsiriwaView, { onExplore: () => setActiveTab("home") }) })
          },
          "zilizotafsiriwa"
        ) : activeTab === "watchlist" ? /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -12 },
            transition: { duration: 0.25, ease: "easeOut" },
            children: /* @__PURE__ */ jsx(WatchlistGrid, { onExplore: () => setActiveTab("home") })
          },
          "watchlist"
        ) : activeTab === "downloads" ? /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -12 },
            transition: { duration: 0.25, ease: "easeOut" },
            children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(ViewLoadingFallback, { message: "Inapakia Kupakuliwa..." }), children: /* @__PURE__ */ jsx(DownloadsView, { onExplore: () => setActiveTab("home") }) })
          },
          "downloads"
        ) : activeTab === "history" ? /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -12 },
            transition: { duration: 0.25, ease: "easeOut" },
            children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(ViewLoadingFallback, { message: "Inapakia Historia..." }), children: /* @__PURE__ */ jsx(HistoryView, { onExplore: () => setActiveTab("home") }) })
          },
          "history"
        ) : activeTab === "profile" ? /* @__PURE__ */ jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -12 },
            transition: { duration: 0.25, ease: "easeOut" },
            children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(ViewLoadingFallback, { message: "Inapakia Akaunti Yako..." }), children: /* @__PURE__ */ jsx(ProfileView, { onNavigateTab: (tab) => setActiveTab(tab) }) })
          },
          "profile"
        ) : activeTab === "home" || activeTab === "discover" ? /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -12 },
            transition: { duration: 0.25, ease: "easeOut" },
            className: "space-y-4 md:space-y-8",
            children: [
              !isTmdbConfigured && /* @__PURE__ */ jsx("div", { className: "p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900 flex items-center justify-between gap-3 shadow-xs", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsx("div", { className: "w-9 h-9 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border border-amber-200", children: "TMDB" }),
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs font-extrabold text-amber-950", children: "TMDB Not Configured" }),
                  /* @__PURE__ */ jsxs("p", { className: "text-[11px] text-amber-800", children: [
                    "Set ",
                    /* @__PURE__ */ jsx("code", { className: "font-mono bg-amber-100/80 px-1 rounded text-amber-900 font-bold", children: "VITE_TMDB_API_KEY" }),
                    " in environment variables to enable live TMDB metadata & movie catalog."
                  ] })
                ] })
              ] }) }),
              /* @__PURE__ */ jsx(HeroBanner, { movies: heroMovies, badge: getBadgeText() }),
              /* @__PURE__ */ jsx(BentoGrid, { title: "Trending This Week", movies: trendingGrid }),
              /* @__PURE__ */ jsx(Recommendations, {}),
              /* @__PURE__ */ jsx(RecentlyUploadedSection, {}),
              curatedDownloads.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between gap-2 mb-2 md:mb-3", children: /* @__PURE__ */ jsx("h2", { className: "text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900", children: "Curated Downloads" }) }),
                /* @__PURE__ */ jsx(CategoryCarousel, { title: "", movies: curatedDownloads })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-2 md:mb-3", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900", children: "Upcoming Releases" }),
                  /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab("upcoming"), className: "text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0", children: "View All" })
                ] }),
                /* @__PURE__ */ jsx(CategoryCarousel, { title: "", movies: upcoming })
              ] }),
              nowPlaying.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-2 md:mb-3", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900", children: "Now Playing in Theaters" }),
                  /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab("popular"), className: "text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0", children: "View All" })
                ] }),
                /* @__PURE__ */ jsx(CategoryCarousel, { title: "", movies: nowPlaying })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-2 md:mb-3", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900", children: "Popular Movies" }),
                  /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab("popular"), className: "text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0", children: "View All" })
                ] }),
                /* @__PURE__ */ jsx(CategoryCarousel, { title: "", movies: popular })
              ] }),
              actionMovies.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-2 md:mb-3", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900", children: "Action & Martial Arts" }),
                  /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab(28), className: "text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0", children: "View All Action" })
                ] }),
                /* @__PURE__ */ jsx(CategoryCarousel, { title: "", movies: actionMovies })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-2 md:mb-3", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900", children: "Top Rated Classics" }),
                  /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab("top_rated"), className: "text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0", children: "View All" })
                ] }),
                /* @__PURE__ */ jsx(CategoryCarousel, { title: "", movies: topRated })
              ] }),
              animationMovies.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-2 md:mb-3", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900", children: "Animation & Family Magic" }),
                  /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab(16), className: "text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0", children: "View All Animation" })
                ] }),
                /* @__PURE__ */ jsx(CategoryCarousel, { title: "", movies: animationMovies })
              ] }),
              sciFiMovies.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-2 md:mb-3", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900", children: "Sci-Fi & Future Worlds" }),
                  /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab(878), className: "text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0", children: "View All Sci-Fi" })
                ] }),
                /* @__PURE__ */ jsx(CategoryCarousel, { title: "", movies: sciFiMovies })
              ] }),
              comedyMovies.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 mb-2 md:mb-3", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900", children: "Comedy & Stand-up Laughs" }),
                  /* @__PURE__ */ jsx("button", { onClick: () => setActiveTab(35), className: "text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0", children: "View All Comedy" })
                ] }),
                /* @__PURE__ */ jsx(CategoryCarousel, { title: "", movies: comedyMovies })
              ] }),
              /* @__PURE__ */ jsx(ZilizotafsiriwaCarousel, { onViewAll: () => setActiveTab("zilizotafsiriwa") })
            ]
          },
          "home-discover"
        ) : /* @__PURE__ */ jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 12 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -12 },
            transition: { duration: 0.25, ease: "easeOut" },
            className: "space-y-6",
            children: [
              /* @__PURE__ */ jsx(HeroBanner, { movies: heroMovies, badge: getBadgeText() }),
              /* @__PURE__ */ jsxs("div", { className: "pt-2", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
                  /* @__PURE__ */ jsx("h2", { className: "text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900", children: activeGenreName ? `${activeGenreName} Movies` : `${String(activeTab).replace("_", " ").toUpperCase()} Movies` }),
                  /* @__PURE__ */ jsx("span", { className: "text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/50", children: "Popularity Ranked" })
                ] }),
                /* @__PURE__ */ jsx(MovieGrid, { category: activeTab })
              ] })
            ]
          },
          `category-${activeTab}`
        ) })
      ] })
    ] }),
    selectedMovieId && /* @__PURE__ */ jsx(ErrorBoundary, { isModal: true, fallbackMessage: "Haikuweza kufungua maelezo ya filamu.", children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(ModalLoadingFallback, {}), children: /* @__PURE__ */ jsx(MovieDetailModal, {}) }) }),
    /* @__PURE__ */ jsx(ErrorBoundary, { isModal: true, fallbackMessage: "Haikuweza kufungua kicheza video.", children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(ModalLoadingFallback, {}), children: /* @__PURE__ */ jsx(VideoPlayerModal, {}) }) }),
    /* @__PURE__ */ jsx(ErrorBoundary, { isModal: true, fallbackMessage: "Haikuweza kufungua mfumo wa kupakua.", children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(ModalLoadingFallback, {}), children: /* @__PURE__ */ jsx(DownloadModal, {}) }) }),
    /* @__PURE__ */ jsx(ErrorBoundary, { isModal: true, fallbackMessage: "Haikuweza kufungua dirisha la akaunti.", children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx(ModalLoadingFallback, {}), children: /* @__PURE__ */ jsx(AuthModal, {}) }) }),
    /* @__PURE__ */ jsx(PwaInstallBanner, {})
  ] });
}
export {
  App as default
};
