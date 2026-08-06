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

export default function App() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [popular, setPopular] = useState<Movie[]>([]);
  const [topRated, setTopRated] = useState<Movie[]>([]);
  const [upcoming, setUpcoming] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<string | number>("home");

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

  const heroMovie = trending.length > 0 ? trending[0] : null;
  const trendingGrid = trending.slice(1, 6);

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Genre Filter Bar */}
        <div className="flex gap-2 overflow-x-auto pb-4 hide-scrollbar mb-8 items-center border-b border-slate-200/60 sticky top-16 z-30 bg-[#F8F9FB]/90 backdrop-blur-md pt-2">
          <button
            onClick={() => setActiveTab("home")}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
              activeTab === "home" 
                ? "bg-slate-900 text-white" 
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            )}
          >
            Discover
          </button>
          
          <div className="w-px h-6 bg-slate-300 mx-2 flex-shrink-0" />
          
          {genres.map(genre => (
            <button
              key={genre.id}
              onClick={() => setActiveTab(genre.id === 0 ? "popular" : genre.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors",
                activeTab === (genre.id === 0 ? "popular" : genre.id)
                  ? "bg-indigo-600 text-white" 
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              )}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {activeTab === "home" ? (
          <div className="space-y-12 animate-in fade-in duration-500">
            <HeroBanner movie={heroMovie} />
            
            <BentoGrid title="Trending This Week" movies={trendingGrid} />
            
            <div className="pt-6 md:pt-8">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl md:text-2xl font-bold text-slate-900">Popular Movies</h2>
                 <button onClick={() => setActiveTab("popular")} className="text-indigo-600 font-bold hover:underline text-sm">View All</button>
              </div>
              <CategoryCarousel title="" movies={popular} />
            </div>
            
            <div className="pt-6 md:pt-8">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl md:text-2xl font-bold text-slate-900">Top Rated Classics</h2>
                 <button onClick={() => setActiveTab("top_rated")} className="text-indigo-600 font-bold hover:underline text-sm">View All</button>
              </div>
              <CategoryCarousel title="" movies={topRated} />
            </div>
            
            <div className="pt-6 md:pt-8">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-xl md:text-2xl font-bold text-slate-900">Upcoming Releases</h2>
                 <button onClick={() => setActiveTab("upcoming")} className="text-indigo-600 font-bold hover:underline text-sm">View All</button>
              </div>
              <CategoryCarousel title="" movies={upcoming} />
            </div>
          </div>
        ) : (
          <MovieGrid category={activeTab} />
        )}
      </main>

      <MovieDetailModal />
      <VideoPlayerModal />
    </div>
  );
}

