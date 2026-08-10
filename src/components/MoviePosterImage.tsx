import { useState, useEffect } from "react";
import { Film } from "lucide-react";
import { getSafeImageUrl, cleanTitleForTMDB, resolvePosterUrl } from "../lib/imageUtils";
import { fetchTmdbPosterFallback } from "../lib/api";

interface MoviePosterImageProps {
  src?: string | null;
  title?: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
  posterPath?: string | null;
  backdropPath?: string | null;
}

export function MoviePosterImage({
  src,
  title,
  alt,
  className = "w-full h-full object-cover",
  loading = "lazy",
  posterPath,
  backdropPath,
}: MoviePosterImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => getSafeImageUrl(src || posterPath || backdropPath));
  const [hasError, setHasError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fallbackStep, setFallbackStep] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    setHasError(false);
    setFallbackStep(0);

    const primaryUrl = getSafeImageUrl(src) || getSafeImageUrl(posterPath) || getSafeImageUrl(backdropPath);
    setImgSrc(primaryUrl);

    // If src is missing or points to Nkiri/WordPress scraped image, resolve poster URL via TMDB or proxy
    const isNkiri = Boolean(
      src && typeof src === "string" && (src.includes("thenkiri") || src.includes("nkiri") || src.includes("wp-content"))
    );

    if (!primaryUrl || isNkiri) {
      setIsLoading(true);
      resolvePosterUrl(src || posterPath || backdropPath, title)
        .then((resolvedUrl) => {
          if (!isMounted) return;
          if (resolvedUrl) {
            setImgSrc(resolvedUrl);
            setHasError(false);
          } else {
            setHasError(true);
          }
          setIsLoading(false);
        })
        .catch(() => {
          if (!isMounted) return;
          setHasError(true);
          setIsLoading(false);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [src, posterPath, backdropPath, title]);

  const handleError = async () => {
    // Step 1: Try alternate provided path (e.g. posterPath if backdrop failed, or vice versa)
    if (fallbackStep === 0) {
      setFallbackStep(1);
      const altUrl = getSafeImageUrl(posterPath) !== imgSrc ? getSafeImageUrl(posterPath) : getSafeImageUrl(backdropPath);
      if (altUrl && altUrl !== imgSrc) {
        setImgSrc(altUrl);
        setHasError(false);
        return;
      }
    }

    // Step 2: Try live TMDB search fallback by title
    if (fallbackStep <= 1 && title) {
      setFallbackStep(2);
      const clean = cleanTitleForTMDB(title);
      if (clean) {
        setIsLoading(true);
        const tmdbPoster = await fetchTmdbPosterFallback(clean);
        setIsLoading(false);
        if (tmdbPoster && tmdbPoster !== imgSrc) {
          setImgSrc(tmdbPoster);
          setHasError(false);
          return;
        }
      }
    }

    setHasError(true);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 flex items-center justify-center">
      {isLoading && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center text-slate-300 z-10 pointer-events-none">
          <Film className="w-6 h-6 text-slate-300" />
        </div>
      )}

      {!hasError && imgSrc && imgSrc.trim() !== "" ? (
        <img
          src={imgSrc}
          alt={alt || title || "Movie poster"}
          onError={handleError}
          loading={loading}
          className={className}
        />
      ) : (
        <div className="absolute inset-0 bg-slate-100/95 flex flex-col items-center justify-center p-2 text-center text-slate-400 pointer-events-none">
          <Film className="w-6 h-6 text-slate-400 mb-1" />
          <span className="text-[10px] font-semibold text-slate-500 line-clamp-2 max-w-[90%] leading-snug">
            {title || "Huncho TV"}
          </span>
        </div>
      )}
    </div>
  );
}
