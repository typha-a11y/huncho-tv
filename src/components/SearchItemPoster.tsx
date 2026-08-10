import { useState, useEffect } from "react";
import { Film } from "lucide-react";
import { Movie } from "../types";
import { fetchTmdbPosterFallback } from "../lib/api";
import { getSafeImageUrl, cleanTitleForTMDB, resolvePosterUrl } from "../lib/imageUtils";

export interface SearchItemPosterProps {
  movie?: Movie;
  title?: string;
  posterUrl?: string | null;
  className?: string;
}

export function SearchItemPoster({
  movie,
  title,
  posterUrl,
  className = "w-12 h-16 object-cover rounded-md shadow-sm shrink-0",
}: SearchItemPosterProps) {
  const rawPoster = posterUrl || (movie as any)?.poster_url || movie?.poster_path || null;
  const rawTitle = title || movie?.title || movie?.original_title || "";
  const cleanTitle = cleanTitleForTMDB(rawTitle);

  const [imgSrc, setImgSrc] = useState<string>(() => getSafeImageUrl(rawPoster));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [triedFallback, setTriedFallback] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const currentPoster = posterUrl || (movie as any)?.poster_url || movie?.poster_path || null;
    const currentTitle = title || movie?.title || movie?.original_title || "";

    setIsLoading(true);
    setIsFailed(false);
    setTriedFallback(false);

    resolvePosterUrl(currentPoster, currentTitle).then((resolvedUrl) => {
      if (!isMounted) return;
      setImgSrc(resolvedUrl);
      setIsLoading(false);
    }).catch(() => {
      if (!isMounted) return;
      setImgSrc("/placeholder-poster.png");
      setIsFailed(true);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [movie?.id, movie?.title, (movie as any)?.poster_url, movie?.poster_path, posterUrl, title]);

  const handleError = async () => {
    if (!triedFallback && cleanTitle) {
      setTriedFallback(true);
      setIsLoading(true);
      const fallbackUrl = await fetchTmdbPosterFallback(cleanTitle);
      if (fallbackUrl) {
        setImgSrc(fallbackUrl);
        setIsFailed(false);
      } else {
        setImgSrc("/placeholder-poster.png");
        setIsFailed(true);
      }
      setIsLoading(false);
    } else {
      setImgSrc("/placeholder-poster.png");
      setIsFailed(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-12 h-16 rounded-md shadow-sm shrink-0 overflow-hidden bg-slate-100 border border-slate-200/60 flex items-center justify-center">
      {isLoading ? (
        <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-300">
          <Film className="w-5 h-5 text-slate-300" />
        </div>
      ) : !isFailed && imgSrc && imgSrc.trim() !== "" ? (
        <img
          src={imgSrc}
          alt={rawTitle || "Movie poster"}
          onError={handleError}
          className={className}
        />
      ) : (
        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
          <Film className="w-5 h-5 text-slate-400" />
        </div>
      )}
    </div>
  );
}

// Aliases for component imports
export const SearchItemThumbnail = SearchItemPoster;
export const MoviePoster = SearchItemPoster;
