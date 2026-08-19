import { useState, useEffect } from "react";
import { AnimatedFlame } from "./AnimatedFlame";
import { motion } from "motion/react";
import { supabase } from "../lib/supabaseClient";
import { Movie } from "../types";
import { CategoryCarousel } from "./BentoGrid";

export function RecentlyUploadedSection() {
  const [recentMovies, setRecentMovies] = useState<Movie[]>([]);
  const [recentSeries, setRecentSeries] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchRecentlyUploaded() {
      try {
        const [moviesRes, seriesRes] = await Promise.all([
          supabase
            .from("movies")
            .select("*")
            .neq("category", "tv-series")
            .neq("category", "chinese-drama")
            .neq("category", "k-drama")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("movies")
            .select("*")
            .or("category.eq.tv-series,category.eq.chinese-drama,category.eq.k-drama")
            .order("created_at", { ascending: false })
            .limit(10),
        ]);

        if (isMounted) {
          const mapMovie = (m: any) => ({
            id: m.id,
            title: m.title,
            original_title: m.title,
            overview: m.overview || `Recently uploaded: ${m.title}`,
            poster_path: m.poster_url || m.poster_path || null,
            poster_url: m.poster_url || null,
            backdrop_path: m.backdrop_url || m.backdrop_path || null,
            release_date: m.created_at || m.release_date,
            vote_average: typeof m.vote_average === "number" ? m.vote_average : (typeof m.rating === "number" ? m.rating : 8.0),
            vote_count: m.vote_count || 100,
            genre_ids: [],
            category: m.category || "Recently Added",
            media_type: "movie",
            imdb_id: m.imdb_id,
          } as any);

          if (moviesRes.data) {
            setRecentMovies(moviesRes.data.map((m) => mapMovie({ ...m, media_type: "movie" })));
          }
          if (seriesRes.data) {
            setRecentSeries(seriesRes.data.map((m) => mapMovie({ ...m, media_type: "tv" })));
          }
        }
      } catch (err) {
        console.warn("RecentlyUploadedSection fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchRecentlyUploaded();

    // Auto refresh recently uploaded section every 10 minutes (600,000 ms)
    const intervalId = setInterval(fetchRecentlyUploaded, 10 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  if (!loading && recentMovies.length === 0 && recentSeries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 md:space-y-8">
      {recentMovies.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <AnimatedFlame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 fill-amber-500 shrink-0" />
              <span>Recently Uploaded Movies</span>
            </h2>
          </div>
          <CategoryCarousel title="" movies={recentMovies} />
        </div>
      )}

      {recentSeries.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
            <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <AnimatedFlame className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 fill-rose-500 shrink-0" />
              <span>Recently Uploaded Series</span>
            </h2>
          </div>
          <CategoryCarousel title="" movies={recentSeries} />
        </div>
      )}
    </div>
  );
}
