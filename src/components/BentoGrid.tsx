import { Star } from "lucide-react";
import { Movie } from "../types";
import { getImageUrl } from "../lib/api";
import { useStore } from "../lib/store";

export function BentoGrid({ title, movies }: { title: string; movies: Movie[] }) {
  const setSelectedMovieId = useStore((s) => s.setSelectedMovieId);

  if (!movies?.length) return null;

  return (
    <section className="py-2 md:py-4">
      <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* Large Feature Item */}
        <div 
          onClick={() => setSelectedMovieId(movies[0].id)}
          className="md:col-span-2 relative h-64 md:h-80 rounded-3xl overflow-hidden cursor-pointer group shadow-sm border border-slate-200/60 hover:scale-[1.02] transition-transform duration-200 ease-out"
        >
          <img 
            src={getImageUrl(movies[0].backdrop_path || movies[0].poster_path, "original")} 
            alt={movies[0].title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-bold mb-2">
              #1 in Trending
            </div>
            <h3 className="text-white text-2xl font-bold">{movies[0].title || movies[0].original_title}</h3>
          </div>
        </div>

        {/* Two smaller items stacked */}
        <div className="grid grid-cols-2 md:grid-cols-1 gap-3 sm:gap-4 h-48 sm:h-64 md:h-80">
          {movies.slice(1, 3).map((movie, idx) => (
            <div 
              key={movie.id}
              onClick={() => setSelectedMovieId(movie.id)}
              className="relative h-full rounded-3xl overflow-hidden cursor-pointer group shadow-sm border border-slate-200/60 hover:scale-[1.02] transition-transform duration-200 ease-out"
            >
              <img 
                src={getImageUrl(movie.backdrop_path || movie.poster_path, "w500")} 
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <div className="inline-block px-2 py-1 bg-indigo-600 rounded-md text-white text-[10px] font-bold mb-1 uppercase tracking-wide">
                  Top #{idx + 2}
                </div>
                <h3 className="text-white font-bold line-clamp-1">{movie.title || movie.original_title}</h3>
              </div>
            </div>
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
      {title && <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-slate-900 mb-4">{title}</h2>}
      <div className="snap-x snap-mandatory overflow-x-auto hide-scrollbar flex gap-3 px-4 -mx-4 pb-4">
        {movies.map((movie) => (
          <div 
            key={movie.id}
            onClick={() => setSelectedMovieId(movie.id)}
            className="snap-start shrink-0 w-[128px] xs:w-[145px] sm:w-[175px] md:w-[200px] flex-shrink-0 cursor-pointer group relative rounded-2xl overflow-hidden shadow-sm border border-slate-200/60 bg-white hover:scale-[1.02] transition-transform duration-200 ease-out"
          >
            <div className="aspect-[2/3] overflow-hidden">
              <img 
                src={getImageUrl(movie.poster_path, "w500")} 
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="p-2 xs:p-3">
              <h4 className="text-xs xs:text-sm font-semibold text-slate-900 line-clamp-1 mt-1.5 leading-tight">{movie.title || movie.original_title}</h4>
              <p className="text-[10px] xs:text-xs text-slate-500 mt-1 font-medium flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {movie.vote_average?.toFixed(1)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
