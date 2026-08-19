import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useStore } from "../lib/store";
import { getMovieDetails, getMoviesByGenre } from "../lib/api";
import { CategoryCarousel } from "./BentoGrid";
import { Movie } from "../types";

export function Recommendations() {
  const { watchlist } = useStore();
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [genreName, setGenreName] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadRecommendations() {
      if (watchlist.length === 0) {
        if (isMounted) setRecommendedMovies([]);
        return;
      }

      try {
        // Sample up to 5 most recently added movies from watchlist
        const recentIds = watchlist.slice(-5);
        const details = await Promise.all(recentIds.map(id => getMovieDetails(id)));
        
        // Count genre frequencies
        const genreCounts: Record<number, number> = {};
        const genreNames: Record<number, string> = {};

        details.forEach(movie => {
          if (movie && movie.genres) {
            movie.genres.forEach(g => {
              genreCounts[g.id] = (genreCounts[g.id] || 0) + 1;
              genreNames[g.id] = g.name;
            });
          }
        });

        // Find top genre
        let topGenreId: number | null = null;
        let maxCount = 0;
        Object.entries(genreCounts).forEach(([idStr, count]) => {
          if (count > maxCount) {
            maxCount = count;
            topGenreId = Number(idStr);
          }
        });

        if (topGenreId && isMounted) {
          const movies = await getMoviesByGenre(topGenreId, 1);
          // filter out movies already in watchlist
          const filtered = movies.filter(m => !watchlist.includes(m.id));
          
          if (isMounted && filtered.length > 0) {
            setRecommendedMovies(filtered);
            setGenreName(genreNames[topGenreId] || "Your Favorites");
          }
        }
      } catch (err) {
        console.error("Recommendations error", err);
      }
    }

    loadRecommendations();

    return () => { isMounted = false; };
  }, [watchlist]);

  if (watchlist.length === 0 || recommendedMovies.length === 0) return null;

  return (
    <motion.div 
      initial={{ scale: 0.97, y: 24, rotateX: 4 }}
      whileInView={{ scale: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true, margin: "-30px", amount: 0.15 }}
      transition={{ type: "spring", stiffness: 280, damping: 24 }}
      style={{ transformPerspective: 1200 }}
      className="pt-2"
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900">
          Because You Liked {genreName}
        </h2>
      </div>
      <CategoryCarousel title="" movies={recommendedMovies} />
    </motion.div>
  );
}
