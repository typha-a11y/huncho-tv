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
import { getTrendingMovies } from "./lib/api";
import { Movie } from "./types";

export default function App() {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTrendingMovies().then((data) => {
      setTrending(data);
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
  const trendingGrid = trending.slice(1, 6); // next 5 for grid
  const actionCarousel = trending.filter(m => m.genre_ids?.includes(28)).slice(0, 10);
  const dramaCarousel = trending.filter(m => m.genre_ids?.includes(18) || m.genre_ids?.includes(878)).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-900 font-sans pb-20">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
        <HeroBanner movie={heroMovie} />
        
        <BentoGrid title="Trending This Week" movies={trendingGrid} />
        
        <CategoryCarousel title="Action & Adventure" movies={actionCarousel.length ? actionCarousel : trending.slice(5, 12)} />
        
        <CategoryCarousel title="Sci-Fi & Drama" movies={dramaCarousel.length ? dramaCarousel : trending.slice(2, 9)} />
      </main>

      <MovieDetailModal />
      <VideoPlayerModal />
    </div>
  );
}

