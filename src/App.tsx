/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bookmark, Download, User as UserIcon, Radio } from "lucide-react";
import { AnimatedFlame } from "./components/AnimatedFlame";
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
import { Movie, Genre } from "./types";
import { cn } from "./lib/utils";
import { useStore } from "./lib/store";
import { supabase, isSupabaseConfigured } from "./lib/supabaseClient";

import { MovieDetailModal } from "./components/MovieDetailModal";
import { VideoPlayerModal } from "./components/VideoPlayerModal";
import { StreamPlayerModal } from "./components/StreamPlayerModal";
import { DownloadModal } from "./components/DownloadModal";
import { AuthModal } from "./components/AuthModal";
import { ProfileView } from "./components/ProfileView";
import { DownloadsView } from "./components/DownloadsView";
import { HistoryView } from "./components/HistoryView";
import { ZilizotafsiriwaView } from "./components/ZilizotafsiriwaView";
import { LiveSportsView } from "./components/LiveSportsView";
import { PlansModal } from "./components/PlansModal";
import { SettingsModal } from "./components/SettingsModal";

export default function App() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([]);
  const [actionMovies, setActionMovies] = useState<Movie[]>([]);
  const [animationMovies, setAnimationMovies] = useState<Movie[]>([]);
  const [sciFiMovies, setSciFiMovies] = useState<Movie[]>([]);
  const [comedyMovies, setComedyMovies] = useState<Movie[]>([]);
  const [curatedDownloads, setCuratedDownloads] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<string | number>("home");
  const { selectedMovieId, watchlist, downloads, user, setUser } = useStore();

  // Supabase Auth listener & Session restoration
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
          created_at: u.created_at,
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
          created_at: u.created_at,
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

    // Auto refresh homepage data every 10 minutes (600,000 ms)
    const intervalId = setInterval(loadHomeData, 10 * 60 * 1000);

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
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans pb-20 overflow-x-hidden">
      <PullToRefresh onRefresh={handleRefresh}>
        <Navbar 
          activeTab={activeTab}
          onSelectDiscover={() => setActiveTab("home")} 
          onSelectLiveSports={() => setActiveTab("live-sports")}
          onSelectZilizotafsiriwa={() => setActiveTab("zilizotafsiriwa")}
          onSelectWatchlist={() => setActiveTab("watchlist")}
          onSelectDownloads={() => setActiveTab("downloads")}
          onSelectProfile={() => setActiveTab("profile")}
        />
        
        <main className={cn("w-full mx-auto pt-2 pb-4", activeTab === "profile" ? "px-0 max-w-full" : "max-w-7xl px-4 xs:px-5 sm:px-6 md:px-8")}>
        
        {/* Genre & Nav Filter Bar */}
        <div className={cn("flex items-center gap-2 overflow-x-auto hide-scrollbar py-3 my-2 sticky top-16 z-30 bg-[#F8F9FB]/90 backdrop-blur-md px-1", activeTab === "profile" ? "px-4 sm:px-6 w-full" : "")}>
          <button
            onClick={() => setActiveTab("home")}
            className={cn(
              "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none shrink-0",
              activeTab === "home" || activeTab === "discover"
                ? "text-white font-semibold" 
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
            )}
          >
            {(activeTab === "home" || activeTab === "discover") && (
              <motion.div
                layoutId="activeGenrePill"
                className="absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/25"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">Discover</span>
          </button>

          {/* Live Sports & TV Category Tab */}
          <button
            onClick={() => setActiveTab("live-sports")}
            className={cn(
              "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-3.5 py-1.5 outline-none select-none flex items-center gap-1.5 shrink-0",
              activeTab === "live-sports"
                ? "text-white font-semibold" 
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 bg-slate-100/60"
            )}
          >
            {activeTab === "live-sports" && (
              <motion.div
                layoutId="activeGenrePill"
                className="absolute inset-0 bg-emerald-600 rounded-full shadow-md shadow-emerald-500/25 z-0"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            
            <span className="relative z-10 flex items-center gap-1.5">
              <Radio className={cn("w-3.5 h-3.5 text-emerald-500 shrink-0", activeTab === "live-sports" && "text-white")} />
              <span>Live Sports & TV</span>
              <span className={cn(
                "text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none tracking-tight",
                activeTab === "live-sports"
                  ? "bg-amber-400 text-slate-950"
                  : "bg-emerald-100 text-emerald-800"
              )}>
                ⚡ SOON
              </span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("zilizotafsiriwa")}
            className={cn(
              "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-bold text-xs rounded-full px-4 py-1.5 outline-none select-none flex items-center gap-1.5 shrink-0",
              activeTab === "zilizotafsiriwa"
                ? "text-white font-extrabold" 
                : "text-purple-700 bg-purple-50 hover:bg-purple-100 hover:text-purple-900"
            )}
          >
            {activeTab === "zilizotafsiriwa" && (
              <motion.div
                layoutId="activeGenrePill"
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-md shadow-purple-500/25"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <AnimatedFlame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              Zilizotafsiriwa
              <span className={cn(
                "text-[10px] font-black px-1.5 py-0.2 rounded-full ml-0.5",
                activeTab === "zilizotafsiriwa" ? "bg-amber-400 text-slate-950" : "bg-purple-200 text-purple-900"
              )}>
                HOT
              </span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("watchlist")}
            className={cn(
              "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none flex items-center gap-1.5 shrink-0",
              activeTab === "watchlist"
                ? "text-white font-semibold" 
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
            )}
          >
            {activeTab === "watchlist" && (
              <motion.div
                layoutId="activeGenrePill"
                className="absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/25"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5" />
              Watchlist
              {watchlist.length > 0 && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5",
                  activeTab === "watchlist" ? "bg-white/20 text-white" : "bg-indigo-100 text-indigo-700"
                )}>
                  {watchlist.length}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("downloads")}
            className={cn(
              "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none flex items-center gap-1.5 shrink-0",
              activeTab === "downloads"
                ? "text-white font-semibold" 
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
            )}
          >
            {activeTab === "downloads" && (
              <motion.div
                layoutId="activeGenrePill"
                className="absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/25"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <Download className="w-3.5 h-3.5" />
              Downloads
              {downloads.length > 0 && (
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5",
                  activeTab === "downloads" ? "bg-white/20 text-white" : "bg-emerald-100 text-emerald-800"
                )}>
                  {downloads.length}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={cn(
              "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none flex items-center gap-1.5 shrink-0",
              activeTab === "profile"
                ? "text-white font-semibold" 
                : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
            )}
          >
            {activeTab === "profile" && (
              <motion.div
                layoutId="activeGenrePill"
                className="absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/25"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1">
              <UserIcon className="w-3.5 h-3.5" />
              Profile
              {user && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-0.5" />
              )}
            </span>
          </button>
          
          {genres.map(genre => {
            const isActive = activeTab === genre.id;
            return (
              <button
                key={genre.id}
                onClick={() => setActiveTab(genre.id)}
                className={cn(
                  "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none shrink-0",
                  isActive
                    ? "text-white font-semibold" 
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeGenrePill"
                    className="absolute inset-0 bg-indigo-600 rounded-full shadow-md shadow-indigo-500/25"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{genre.name}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "live-sports" ? (
            <motion.div
              key="live-sports"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Suspense fallback={<ViewLoadingFallback message="Inapakia Michezo na TV..." />}>
                <LiveSportsView onExplore={() => setActiveTab("home")} />
              </Suspense>
            </motion.div>
          ) : activeTab === "zilizotafsiriwa" ? (
            <motion.div
              key="zilizotafsiriwa"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Suspense fallback={<ViewLoadingFallback message="Inapakia Filamu Zilizotafsiriwa..." />}>
                <ZilizotafsiriwaView onExplore={() => setActiveTab("home")} />
              </Suspense>
            </motion.div>
          ) : activeTab === "watchlist" ? (
            <motion.div
              key="watchlist"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <WatchlistGrid onExplore={() => setActiveTab("home")} />
            </motion.div>
          ) : activeTab === "downloads" ? (
            <motion.div
              key="downloads"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Suspense fallback={<ViewLoadingFallback message="Inapakia Kupakuliwa..." />}>
                <DownloadsView onExplore={() => setActiveTab("home")} />
              </Suspense>
            </motion.div>
          ) : activeTab === "history" ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Suspense fallback={<ViewLoadingFallback message="Inapakia Historia..." />}>
                <HistoryView onExplore={() => setActiveTab("home")} />
              </Suspense>
            </motion.div>
          ) : activeTab === "profile" ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Suspense fallback={<ViewLoadingFallback message="Inapakia Akaunti Yako..." />}>
                <ProfileView onNavigateTab={(tab) => setActiveTab(tab)} />
              </Suspense>
            </motion.div>
          ) : activeTab === "home" || activeTab === "discover" ? (
            <motion.div 
              key="home-discover"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-4 md:space-y-8"
            >
              {!isTmdbConfigured && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/80 text-amber-900 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center font-black text-xs shrink-0 border border-amber-200">
                      TMDB
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-amber-950">TMDB Not Configured</p>
                      <p className="text-[11px] text-amber-800">
                        Set <code className="font-mono bg-amber-100/80 px-1 rounded text-amber-900 font-bold">VITE_TMDB_API_KEY</code> in environment variables to enable live TMDB metadata & movie catalog.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <HeroBanner movies={heroMovies} badge={getBadgeText()} />
              
              {/* Trending Bento Grid */}
              <BentoGrid title="Trending This Week" movies={trendingGrid} />

              {/* Personalized Recommendations */}
              <Recommendations />

              {/* Recently Uploaded Movies & Series */}
              <RecentlyUploadedSection />

              {/* Curated Downloads */}
              {curatedDownloads.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px", amount: 0.15 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
                     <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Curated Downloads</h2>
                  </div>
                  <CategoryCarousel title="" movies={curatedDownloads} />
                </motion.div>
              )}

              {/* Upcoming Releases */}
              <motion.div
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px", amount: 0.15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
                   <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Upcoming Releases</h2>
                   <button onClick={() => setActiveTab("upcoming")} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All</button>
                </div>
                <CategoryCarousel title="" movies={upcoming} />
              </motion.div>

              {/* Now Playing in Cinemas */}
              {nowPlaying.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px", amount: 0.15 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
                    <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Now Playing in Theaters</h2>
                    <button onClick={() => setActiveTab("popular")} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All</button>
                  </div>
                  <CategoryCarousel title="" movies={nowPlaying} />
                </motion.div>
              )}
              
              {/* Popular Movies */}
              <motion.div
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px", amount: 0.15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
                   <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Popular Movies</h2>
                   <button onClick={() => setActiveTab("popular")} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All</button>
                </div>
                <CategoryCarousel title="" movies={popular} />
              </motion.div>

              {/* Action & Martial Arts */}
              {actionMovies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px", amount: 0.15 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
                    <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Action & Martial Arts</h2>
                    <button onClick={() => setActiveTab(28)} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All Action</button>
                  </div>
                  <CategoryCarousel title="" movies={actionMovies} />
                </motion.div>
              )}
              
              {/* Top Rated Classics */}
              <motion.div
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px", amount: 0.15 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
                   <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Top Rated Classics</h2>
                   <button onClick={() => setActiveTab("top_rated")} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All</button>
                </div>
                <CategoryCarousel title="" movies={topRated} />
              </motion.div>

              {/* Animation & Family Magic */}
              {animationMovies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px", amount: 0.15 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
                    <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Animation & Family Magic</h2>
                    <button onClick={() => setActiveTab(16)} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All Animation</button>
                  </div>
                  <CategoryCarousel title="" movies={animationMovies} />
                </motion.div>
              )}

              {/* Sci-Fi & Cyberpunk */}
              {sciFiMovies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px", amount: 0.15 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
                    <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Sci-Fi & Future Worlds</h2>
                    <button onClick={() => setActiveTab(878)} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All Sci-Fi</button>
                  </div>
                  <CategoryCarousel title="" movies={sciFiMovies} />
                </motion.div>
              )}

              {/* Comedy & Laughs */}
              {comedyMovies.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px", amount: 0.15 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
                    <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Comedy & Stand-up Laughs</h2>
                    <button onClick={() => setActiveTab(35)} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All Comedy</button>
                  </div>
                  <CategoryCarousel title="" movies={comedyMovies} />
                </motion.div>
              )}

              {/* Swahili Dubbed Featured Section */}
              <ZilizotafsiriwaCarousel onViewAll={() => setActiveTab("zilizotafsiriwa")} />
            </motion.div>
          ) : (
            <motion.div 
              key={`category-${activeTab}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-6"
            >
              <HeroBanner movies={heroMovies} badge={getBadgeText()} />

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
                    {activeGenreName ? `${activeGenreName} Movies` : `${String(activeTab).replace('_', ' ').toUpperCase()} Movies`}
                  </h2>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/50">
                    Popularity Ranked
                  </span>
                </div>
                
                <MovieGrid category={activeTab} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      </PullToRefresh>

      {selectedMovieId && (
        <ErrorBoundary isModal fallbackMessage="Haikuweza kufungua maelezo ya filamu.">
          <Suspense fallback={<ModalLoadingFallback />}>
            <MovieDetailModal />
          </Suspense>
        </ErrorBoundary>
      )}
      <ErrorBoundary isModal fallbackMessage="Haikuweza kufungua kicheza video.">
        <Suspense fallback={<ModalLoadingFallback />}>
          <VideoPlayerModal />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary isModal fallbackMessage="Haikuweza kufungua mfumo wa kupakua.">
        <Suspense fallback={<ModalLoadingFallback />}>
          <DownloadModal />
        </Suspense>
      </ErrorBoundary>
      <ErrorBoundary isModal fallbackMessage="Haikuweza kufungua dirisha la akaunti.">
        <Suspense fallback={<ModalLoadingFallback />}>
          <AuthModal />
        </Suspense>
      </ErrorBoundary>
      <PwaInstallBanner />
    </div>
  );
}

