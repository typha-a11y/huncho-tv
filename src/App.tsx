/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { Navbar } from "./components/Navbar";
import { HeroBanner } from "./components/HeroBanner";
import { BentoGrid, CategoryCarousel } from "./components/BentoGrid";
import { MovieDetailModal } from "./components/MovieDetailModal";
import { VideoPlayerModal } from "./components/VideoPlayerModal";
import { MovieGrid } from "./components/MovieGrid";
import { 
  getTrendingMovies, 
  getPopularMovies, 
  getTopRatedMovies, 
  getUpcomingMovies,
  getGenres
} from "./lib/api";
import { Movie, Genre } from "./types";
import { cn } from "./lib/utils";
import { useStore } from "./lib/store";

export default function App() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<string | number>("home");
  const { selectedMovieId } = useStore();

  useEffect(() => {
    Promise.all([
      getTrendingMovies(),
      getPopularMovies(),
      getTopRatedMovies(),
      getUpcomingMovies(),
      getGenres()
    ]).then(([trendingData, popularData, topRatedData, upcomingData, genresData]) => {
      setTrending(trendingData);
      setPopular(popularData);
      setTopRated(topRatedData);
      setUpcoming(upcomingData);
      setGenres([{ id: 0, name: "All" }, ...genresData]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const trendingGrid = trending.slice(5, 10);

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans pb-20 overflow-x-hidden">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 md:px-8 pt-2 pb-4">
        
        {/* Genre Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar py-2 my-2 sticky top-16 z-30 bg-[#F8F9FB]/90 backdrop-blur-md">
              <button
                onClick={() => setActiveTab("home")}
                className={cn(
                  "whitespace-nowrap transition-colors",
                  activeTab === "home" 
                    ? "bg-indigo-600 text-white font-semibold text-xs rounded-full px-4 py-1.5 shadow-sm" 
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-full px-4 py-1.5"
                )}
              >
                Discover
              </button>
              
              {genres.map(genre => (
                <button
                  key={genre.id}
                  onClick={() => setActiveTab(genre.id === 0 ? "popular" : genre.id)}
                  className={cn(
                    "whitespace-nowrap transition-colors",
                    activeTab === (genre.id === 0 ? "popular" : genre.id)
                      ? "bg-indigo-600 text-white font-semibold text-xs rounded-full px-4 py-1.5 shadow-sm" 
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs rounded-full px-4 py-1.5"
                  )}
                >
                  {genre.name}
                </button>
              ))}
            </div>

            {activeTab === "home" ? (
              <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
                <HeroBanner movies={trending} />
                
                <BentoGrid title="Trending This Week" movies={trendingGrid} />
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Popular Movies</h2>
                     <button onClick={() => setActiveTab("popular")} className="text-indigo-600 font-bold hover:underline text-sm">View All</button>
                  </div>
                  <CategoryCarousel title="" movies={popular} />
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Top Rated Classics</h2>
                     <button onClick={() => setActiveTab("top_rated")} className="text-indigo-600 font-bold hover:underline text-sm">View All</button>
                  </div>
                  <CategoryCarousel title="" movies={topRated} />
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-4">
                     <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">Upcoming Releases</h2>
                     <button onClick={() => setActiveTab("upcoming")} className="text-indigo-600 font-bold hover:underline text-sm">View All</button>
                  </div>
                  <CategoryCarousel title="" movies={upcoming} />
                </div>
              </div>
            ) : (
              <MovieGrid category={activeTab} />
            )}
          </main>

      {selectedMovieId && <MovieDetailModal />}
      <VideoPlayerModal />
    </div>
  );
}

