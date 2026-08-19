import { motion } from "motion/react";
import { Star } from "lucide-react";
import { AnimatedFlame } from "./AnimatedFlame";
import { Movie } from "../types";
import { getPrimaryGenre } from "../lib/api";
import { useStore } from "../lib/store";
import { MoviePosterImage } from "./MoviePosterImage";

export function BentoGrid({ title, movies }: { title: string; movies: Movie[] }) {
  const setSelectedMovieId = useStore((s) => s.setSelectedMovieId);

  if (!movies?.length) return null;

  return (
    <section className="py-2 md:py-4">
      <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 mb-4 flex items-center gap-2">
        <AnimatedFlame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 fill-amber-500 shrink-0" />
        <span>{title}</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Large Feature Item */}
        <motion.div 
          role="button"
          tabIndex={0}
          aria-label={`View details for ${movies[0].title || movies[0].original_title}`}
          whileHover={{ y: -3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
          onClick={() => setSelectedMovieId(movies[0].id, movies[0].media_type)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelectedMovieId(movies[0].id, movies[0].media_type);
            }
          }}
          className="md:col-span-2 relative h-64 md:h-80 rounded-3xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all duration-300"
        >
          <MoviePosterImage 
            src={movies[0].backdrop_path || (movies[0] as any).poster_url || movies[0].poster_path} 
            posterPath={movies[0].poster_path || (movies[0] as any).poster_url}
            backdropPath={movies[0].backdrop_path}
            title={movies[0].title || movies[0].original_title}
            alt={movies[0].title}
            loading="eager"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 p-6 pointer-events-none">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-white text-[10px] font-bold">
                #1 in Trending
              </div>
              {getPrimaryGenre(movies[0].genre_ids) && (
                <div className="inline-block px-1.5 py-0.5 bg-indigo-600/80 backdrop-blur-md rounded-md text-white text-[9px] font-bold">
                  {getPrimaryGenre(movies[0].genre_ids)}
                </div>
              )}
            </div>
            <h3 className="text-white text-2xl font-bold">{movies[0].title || movies[0].original_title}</h3>
          </div>
        </motion.div>

        {/* Two smaller items stacked */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 sm:gap-4 h-48 sm:h-64 md:h-80">
          {movies.slice(1, 3).map((movie, idx) => (
            <motion.div 
              key={`${movie.id}-${idx}`}
              role="button"
              tabIndex={0}
              aria-label={`View details for ${movie.title || movie.original_title}`}
              whileHover={{ y: -3, scale: 1.015 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedMovieId(movie.id, movie.media_type)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedMovieId(movie.id, movie.media_type);
                }
              }}
              className="relative h-full rounded-3xl overflow-hidden cursor-pointer group shadow-sm hover:shadow-xl border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 transition-all duration-300"
            >
              <MoviePosterImage 
                src={movie.backdrop_path || (movie as any).poster_url || movie.poster_path} 
                posterPath={movie.poster_path || (movie as any).poster_url}
                backdropPath={movie.backdrop_path}
                title={movie.title || movie.original_title}
                alt={movie.title}
                loading="eager"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 p-4 pointer-events-none">
                <div className="flex items-center gap-1 mb-1">
                  <div className="inline-block px-1.5 py-0.5 bg-indigo-600 rounded-md text-white text-[9px] font-bold uppercase tracking-wide">
                    Top #{idx + 2}
                  </div>
                  {getPrimaryGenre(movie.genre_ids) && (
                    <div className="inline-block px-1 py-0.5 bg-white/20 backdrop-blur-md rounded text-white text-[8px] font-semibold">
                      {getPrimaryGenre(movie.genre_ids)}
                    </div>
                  )}
                </div>
                <h3 className="text-white font-bold line-clamp-1">{movie.title || movie.original_title}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoryCarousel({ title, movies }: { title: string; movies: Movie[] }) {
  const setSelectedMovieId = useStore((s) => s.setSelectedMovieId);

  if (!movies?.length) return null;

  return (
    <section className={title ? "py-2 md:py-4" : ""}>
      {title && (
        <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 mb-4 flex items-center gap-2">
          {(title.toLowerCase().includes("trending") || title.toLowerCase().includes("upload") || title.toLowerCase().includes("hot") || title.toLowerCase().includes("popular")) && (
            <AnimatedFlame className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 fill-amber-500 shrink-0" />
          )}
          <span>{title}</span>
        </h2>
      )}
      <div className="snap-x snap-mandatory overflow-x-auto hide-scrollbar flex gap-3 px-4 -mx-4 pb-4">
        {movies.map((movie, index) => (
          <motion.div 
            key={`${movie.id}-${index}`}
            role="button"
            tabIndex={0}
            aria-label={`View details for ${movie.title || movie.original_title}`}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSelectedMovieId(movie.id, movie.media_type)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedMovieId(movie.id, movie.media_type);
              }
            }}
            className="snap-start shrink-0 w-[125px] xs:w-[145px] sm:w-[175px] flex-shrink-0 cursor-pointer group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200/60 bg-white transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          >
            <div className="aspect-[2/3] overflow-hidden relative">
              <MoviePosterImage
                src={(movie as any).poster_url || movie.poster_path || movie.backdrop_path}
                posterPath={movie.poster_path || (movie as any).poster_url}
                backdropPath={movie.backdrop_path}
                title={movie.title || movie.original_title}
                alt={movie.title || movie.original_title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {((movie as any).category || getPrimaryGenre(movie.genre_ids)) && (
                <span className="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 px-1 py-[1px] sm:px-1.5 sm:py-0.5 bg-slate-900/80 backdrop-blur-md text-white text-[7px] xs:text-[8px] sm:text-[9px] font-bold rounded-xs sm:rounded-md border border-white/20 leading-none shadow-xs uppercase tracking-tight max-w-[85%] truncate z-10 pointer-events-none">
                  {(movie as any).category || getPrimaryGenre(movie.genre_ids)}
                </span>
              )}
            </div>
            <div className="p-2 xs:p-3">
              <h4 className="text-xs xs:text-sm font-semibold text-slate-900 line-clamp-1 mt-1.5 leading-tight">{movie.title || movie.original_title}</h4>
              <p className="text-[10px] xs:text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {movie.vote_average?.toFixed(1)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
