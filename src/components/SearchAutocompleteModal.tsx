import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Search, 
  X, 
  TrendingUp, 
  Clock, 
  Star, 
  Sparkles, 
  Film, 
  Tv, 
  Radio, 
  ArrowRight, 
  Flame, 
  Trash2, 
  Loader2,
  ChevronRight,
  Compass
} from "lucide-react";
import { searchMulti, getTrendingMovies, genreNameMap } from "../lib/api";
import { Movie } from "../types";
import { useStore } from "../lib/store";
import { SearchItemPoster } from "./SearchItemPoster";

interface SearchAutocompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLiveSports?: () => void;
  onSelectZilizotafsiriwa?: () => void;
}

const STATIC_TRENDING_SEARCHES = [
  "Deadpool & Wolverine",
  "Dune: Part Two",
  "Simba vs Yanga",
  "Inside Out 2",
  "House of the Dragon",
  "Oppenheimer",
  "Gladiator II",
  "Zilizotafsiriwa DJ Afro",
  "Premier League Live"
];

const POPULAR_GENRE_PILLS = [
  { label: "Action", icon: Flame, query: "Action" },
  { label: "Sci-Fi", icon: Sparkles, query: "Sci-Fi" },
  { label: "Comedy", icon: Compass, query: "Comedy" },
  { label: "Horror", icon: Film, query: "Horror" },
  { label: "Live Sports", icon: Radio, query: "Sports", isSports: true },
  { label: "Zilizotafsiriwa", icon: Tv, query: "Swahili", isZilizo: true },
];

const RECENT_SEARCHES_KEY = "huncho_recent_searches_v2";

export function SearchAutocompleteModal({
  isOpen,
  onClose,
  onSelectLiveSports,
  onSelectZilizotafsiriwa
}: SearchAutocompleteModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [dynamicTrending, setDynamicTrending] = useState<string[]>(STATIC_TRENDING_SEARCHES);

  const inputRef = useRef<HTMLInputElement>(null);
  const setSelectedMovieId = useStore((s) => s.setSelectedMovieId);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Fetch dynamic trending movie titles to enrich trending searches
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    getTrendingMovies()
      .then((movies) => {
        if (!isMounted || !movies || movies.length === 0) return;
        const movieTitles = movies
          .map((m) => m.title || m.original_title)
          .filter(Boolean)
          .slice(0, 6) as string[];

        // Merge with static popular terms, deduplicating
        const combined = Array.from(new Set([...movieTitles, ...STATIC_TRENDING_SEARCHES]));
        setDynamicTrending(combined.slice(0, 8));
      })
      .catch(() => {
        // Fallback to static
        setDynamicTrending(STATIC_TRENDING_SEARCHES);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  // Focus input automatically when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      setSelectedIndex(-1);
    } else {
      setQuery("");
      setResults([]);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchMulti(query.trim());
        setResults(res || []);
      } catch (err) {
        console.warn("Search error:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Save query to recent searches
  const saveRecentSearch = (term: string) => {
    const cleanTerm = term.trim();
    if (!cleanTerm) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== cleanTerm.toLowerCase());
      const updated = [cleanTerm, ...filtered].slice(0, 6);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const removeRecentSearch = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((item) => item !== termToRemove);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const clearAllRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  const handleSelectMovie = (movie: Movie) => {
    const detectedType = movie.media_type || ((movie as any).first_air_date ? "tv" : "movie");
    saveRecentSearch(movie.title || movie.original_title || query);
    setSelectedMovieId(movie.id, detectedType);
    onClose();
  };

  const handleSearchTerm = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
      return;
    }

    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectMovie(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelectMovie(results[0]);
      }
    }
  };

  // Compute autocomplete text suggestion (inline completion)
  const topMatch = results.length > 0 ? (results[0].title || results[0].original_title || "") : "";
  const autocompleteText = useMemo(() => {
    if (!query.trim() || !topMatch) return "";
    if (topMatch.toLowerCase().startsWith(query.toLowerCase())) {
      return query + topMatch.slice(query.length);
    }
    return "";
  }, [query, topMatch]);

  // Helper to highlight matching text in search results
  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim() || !text) return text;
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="text-indigo-600 font-extrabold bg-indigo-50/80 px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search movies, TV shows, and sports"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-center items-start p-3 sm:p-4 pt-[6vh] sm:pt-[10vh] animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[84vh] border border-slate-200/90 text-slate-900 focus:outline-none transition-all"
      >
        {/* ========================================================================= */}
        {/* SEARCH INPUT BAR WITH AUTOCOMPLETE PREDICTION                              */}
        {/* ========================================================================= */}
        <div className="relative flex items-center px-4 py-3.5 sm:py-4 border-b border-slate-100 bg-white">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
          
          <div className="relative flex-1 mx-3">
            {/* Autocomplete ghost text for tab/completion */}
            {autocompleteText && query && (
              <div 
                aria-hidden="true"
                className="absolute inset-y-0 left-0 flex items-center text-base sm:text-lg font-medium text-slate-300 pointer-events-none select-none pl-0.5"
              >
                {autocompleteText}
              </div>
            )}

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, TV series, actors, live derbies..."
              className="w-full text-base sm:text-lg font-medium outline-none text-slate-900 placeholder:text-slate-400 bg-transparent relative z-10"
            />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isLoading ? (
              <Loader2 className="w-4 h-4 text-indigo-600 animate-spin mr-1" />
            ) : query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
            >
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-mono text-slate-500 shadow-2xs">
                ESC
              </kbd>
              <X className="w-5 h-5 sm:hidden" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BODY CONTAINER: RESULTS OR TRENDING / RECENT SEARCHES                     */}
        {/* ========================================================================= */}
        <div className="overflow-y-auto flex-1 p-3 sm:p-4 space-y-5">
          {query.trim().length > 0 ? (
            /* ======================================================================= */
            /* 1. AS-YOU-TYPE AUTOCOMPLETE RESULTS                                    */
            /* ======================================================================= */
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <span>Matching Titles ({results.length})</span>
                {results.length > 0 && (
                  <span className="hidden sm:inline-block text-[11px] text-slate-400 font-normal">
                    Use <kbd className="px-1 py-0.5 bg-slate-100 rounded border border-slate-200">↓</kbd> <kbd className="px-1 py-0.5 bg-slate-100 rounded border border-slate-200">↑</kbd> to navigate, <kbd className="px-1 py-0.5 bg-slate-100 rounded border border-slate-200">↵</kbd> to open
                  </span>
                )}
              </div>

              {results.length > 0 ? (
                <div className="space-y-1">
                  {results.map((movie, idx) => {
                    const isSelected = selectedIndex === idx;
                    const titleText = movie.title || movie.original_title || "Untitled";
                    const yearText = movie.release_date ? movie.release_date.slice(0, 4) : "";
                    const mediaType = movie.media_type === "tv" ? "TV Series" : "Movie";
                    const rating = typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : null;
                    const primaryGenre = movie.genre_ids && movie.genre_ids[0] ? genreNameMap[movie.genre_ids[0]] : null;

                    return (
                      <div
                        key={`${movie.id}-${idx}`}
                        onClick={() => handleSelectMovie(movie)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`flex items-center gap-3.5 p-2.5 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? "bg-indigo-50/90 border border-indigo-200/80 shadow-2xs"
                            : "hover:bg-slate-50 border border-transparent"
                        }`}
                      >
                        <SearchItemPoster movie={movie} className="w-11 h-15 object-cover rounded-lg shadow-xs shrink-0" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm sm:text-base text-slate-900 truncate">
                              {highlightMatch(titleText, query)}
                            </h4>
                            <span className="shrink-0 px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold">
                              {mediaType}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                            {yearText && <span>{yearText}</span>}
                            {primaryGenre && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                                <span>{primaryGenre}</span>
                              </>
                            )}
                            {rating && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-300 inline-block" />
                                <span className="flex items-center gap-1 font-bold text-amber-600">
                                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                  <span>{rating}</span>
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-indigo-600 translate-x-0.5" : "text-slate-300"}`} />
                      </div>
                    );
                  })}
                </div>
              ) : !isLoading ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">No matching titles found for "{query}"</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Try checking for spelling errors, searching for the original English title, or exploring trending genres below.
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            /* ======================================================================= */
            /* 2. DEFAULT EMPTY STATE: RECENT SEARCHES + TRENDING TOPICS + QUICK PILLS  */
            /* ======================================================================= */
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between px-1">
                    <span className="flex items-center gap-1.5 text-xs font-black text-slate-700 uppercase tracking-wider">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Recent Searches</span>
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecentSearches}
                      className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear History</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <div
                        key={i}
                        onClick={() => handleSearchTerm(term)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200/80 hover:border-indigo-200 rounded-full text-xs font-bold text-slate-700 hover:text-indigo-600 transition-all cursor-pointer group"
                      >
                        <Clock className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="text-slate-400 hover:text-rose-500 ml-1 p-0.5 rounded-full"
                          title="Remove from history"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 🔥 Trending Searches */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 px-1 text-xs font-black text-slate-800 uppercase tracking-wider">
                  <TrendingUp className="w-4 h-4 text-rose-500" />
                  <span>Trending Searches</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {dynamicTrending.map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSearchTerm(term)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-indigo-400 rounded-full text-xs font-bold text-slate-800 hover:text-indigo-600 shadow-2xs transition-all cursor-pointer group hover:scale-102"
                    >
                      <Flame className="w-3.5 h-3.5 text-rose-500 group-hover:animate-bounce" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 🎯 Browse by Popular Category / Genre Pills */}
              <div className="space-y-2.5 pt-1 border-t border-slate-100">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider block px-1">
                  Popular Categories & Channels
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_GENRE_PILLS.map((pill, i) => {
                    const Icon = pill.icon;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (pill.isSports && onSelectLiveSports) {
                            onClose();
                            onSelectLiveSports();
                          } else if (pill.isZilizo && onSelectZilizotafsiriwa) {
                            onClose();
                            onSelectZilizotafsiriwa();
                          } else {
                            handleSearchTerm(pill.query);
                          }
                        }}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/70 hover:border-indigo-200 text-left transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 group-hover:text-indigo-600 shadow-2xs">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                            {pill.label}
                          </span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Search powered by TMDB & Supabase Real-time Catalog</span>
          <span className="hidden sm:inline-block">Press ESC anytime to exit</span>
        </div>
      </div>
    </div>
  );
}

export default SearchAutocompleteModal;
