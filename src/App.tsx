/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bookmark, Download, User as UserIcon, Flame } from "lucide-react";
import { Navbar } from "./components/Navbar";
import { HeroBanner } from "./components/HeroBanner";
import { BentoGrid, CategoryCarousel } from "./components/BentoGrid";
import { MovieDetailModal } from "./components/MovieDetailModal";
import { VideoPlayerModal } from "./components/VideoPlayerModal";
import { DownloadModal } from "./components/DownloadModal";
import { AuthModal } from "./components/AuthModal";
import { ProfileView } from "./components/ProfileView";
import { DownloadsView } from "./components/DownloadsView";
import { HistoryView } from "./components/HistoryView";
import { ZilizotafsiriwaView, ZilizotafsiriwaCarousel } from "./components/ZilizotafsiriwaView";
import { MovieGrid } from "./components/MovieGrid";
import { WatchlistGrid } from "./components/WatchlistGrid";
import { PullToRefresh } from "./components/PullToRefresh";
import { 
  getTrendingMovies, 
  getPopularMovies, 
  getTopRatedMovies, 
  getUpcomingMovies,
  getNowPlayingMovies,
  getGenres,
  getMoviesByGenre
} from "./lib/api";
import { Movie, Genre } from "./types";
import { cn } from "./lib/utils";
import { useStore } from "./lib/store";

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
  const [genres, setGenres] = useState<Genre[]>([]);
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<string | number>("home");
  const { selectedMovieId, watchlist, downloads, user } = useStore();

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
        genresData
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
        getGenres()
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
      if (activeTab === "home" || activeTab === "discover") {
        setHeroMovies(trendingData);
      }
    } catch (err) {
      console.error("Failed to refresh movie data:", err);
    }
  };

  useEffect(() => {
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
      getGenres()
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
      genresData
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
      setHeroMovies(trendingData);
      setLoading(false);
    });
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
          onSelectZilizotafsiriwa={() => setActiveTab("zilizotafsiriwa")}
          onSelectWatchlist={() => setActiveTab("watchlist")}
          onSelectDownloads={() => setActiveTab("downloads")}
          onSelectProfile={() => setActiveTab("profile")}
        />
        
        <main className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 md:px-8 pt-2 pb-4">
        
        {/* Genre & Nav Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar py-2.5 my-2 sticky top-16 z-30 bg-[#F8F9FB]/90 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("home")}
            className={cn(
              "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none",
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

          <button
            onClick={() => setActiveTab("zilizotafsiriwa")}
            className={cn(
              "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-bold text-xs rounded-full px-4 py-1.5 outline-none select-none flex items-center gap-1.5",
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
            <span className="relative z-10 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
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
              "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none flex items-center gap-1.5",
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
              "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none flex items-center gap-1.5",
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
              "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none flex items-center gap-1.5",
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
                  "relative whitespace-nowrap transition-colors duration-200 cursor-pointer font-medium text-xs rounded-full px-4 py-1.5 outline-none select-none",
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
          {activeTab === "zilizotafsiriwa" ? (
            <motion.div
              key="zilizotafsiriwa"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <ZilizotafsiriwaView onExplore={() => setActiveTab("home")} />
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
              <DownloadsView onExplore={() => setActiveTab("home")} />
            </motion.div>
          ) : activeTab === "history" ? (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <HistoryView onExplore={() => setActiveTab("home")} />
            </motion.div>
          ) : activeTab === "profile" ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <ProfileView onNavigateTab={(tab) => setActiveTab(tab)} />
            </motion.div>
          ) : activeTab === "home" || activeTab === "discover" ? (
            <motion.div 
              key="home-discover"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="space-y-6 sm:space-y-8"
            >
              <HeroBanner movies={heroMovies} badge={getBadgeText()} />
              
              {/* Trending Bento Grid */}
              <BentoGrid title="Trending This Week" movies={trendingGrid} />

              {/* Upcoming Releases */}
              <div className="pt-2">
                <div className="flex items-center justify-between gap-2 mb-4">
                   <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Upcoming Releases</h2>
                   <button onClick={() => setActiveTab("upcoming")} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All</button>
                </div>
                <CategoryCarousel title="" movies={upcoming} />
              </div>

              {/* Now Playing in Cinemas */}
              {nowPlaying.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Now Playing in Theaters</h2>
                    <button onClick={() => setActiveTab("popular")} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All</button>
                  </div>
                  <CategoryCarousel title="" movies={nowPlaying} />
                </div>
              )}
              
              {/* Popular Movies */}
              <div className="pt-2">
                <div className="flex items-center justify-between gap-2 mb-4">
                   <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Popular Movies</h2>
                   <button onClick={() => setActiveTab("popular")} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All</button>
                </div>
                <CategoryCarousel title="" movies={popular} />
              </div>

              {/* Action & Martial Arts */}
              {actionMovies.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Action & Martial Arts</h2>
                    <button onClick={() => setActiveTab(28)} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All Action</button>
                  </div>
                  <CategoryCarousel title="" movies={actionMovies} />
                </div>
              )}
              
              {/* Top Rated Classics */}
              <div className="pt-2">
                <div className="flex items-center justify-between gap-2 mb-4">
                   <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Top Rated Classics</h2>
                   <button onClick={() => setActiveTab("top_rated")} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All</button>
                </div>
                <CategoryCarousel title="" movies={topRated} />
              </div>

              {/* Animation & Family Magic */}
              {animationMovies.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Animation & Family Magic</h2>
                    <button onClick={() => setActiveTab(16)} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All Animation</button>
                  </div>
                  <CategoryCarousel title="" movies={animationMovies} />
                </div>
              )}

              {/* Sci-Fi & Cyberpunk */}
              {sciFiMovies.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Sci-Fi & Future Worlds</h2>
                    <button onClick={() => setActiveTab(878)} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All Sci-Fi</button>
                  </div>
                  <CategoryCarousel title="" movies={sciFiMovies} />
                </div>
              )}

              {/* Comedy & Laughs */}
              {comedyMovies.length > 0 && (
                <div className="pt-2">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Comedy & Stand-up Laughs</h2>
                    <button onClick={() => setActiveTab(35)} className="text-indigo-600 font-bold hover:underline text-xs sm:text-sm cursor-pointer whitespace-nowrap shrink-0">View All Comedy</button>
                  </div>
                  <CategoryCarousel title="" movies={comedyMovies} />
                </div>
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

      {selectedMovieId && <MovieDetailModal />}
      <VideoPlayerModal />
      <DownloadModal />
      <AuthModal />
    </div>
  );
}

