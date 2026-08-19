import { useState, useEffect, lazy, Suspense } from "react";
import { Search, User, PlayCircle, X, Star, Settings, Bookmark, Download, Crown } from "lucide-react";
import { searchMulti, getImageUrl } from "../lib/api";
import { Movie } from "../types";
import { useStore } from "../lib/store";
import { SearchItemPoster } from "./SearchItemPoster";
import logoImg from "../assets/logo.png";

import { SettingsModal } from "./SettingsModal";

interface NavbarProps {
  onSelectDiscover?: () => void;
  onSelectLiveSports?: () => void;
  onSelectZilizotafsiriwa?: () => void;
  onSelectWatchlist?: () => void;
  onSelectDownloads?: () => void;
  onSelectProfile?: () => void;
  activeTab?: string | number;
}

export function Navbar({ onSelectDiscover, onSelectLiveSports, onSelectZilizotafsiriwa, onSelectWatchlist, onSelectDownloads, onSelectProfile, activeTab }: NavbarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const setSelectedMovieId = useStore((s) => s.setSelectedMovieId);
  const watchlist = useStore((s) => s.watchlist);
  const downloads = useStore((s) => s.downloads);
  const user = useStore((s) => s.user);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (query.trim()) {
        searchMulti(query).then(setResults);
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [query]);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 md:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo & VIP Crown */}
          <div onClick={onSelectDiscover} className="flex items-center gap-2.5 cursor-pointer shrink-0 py-1">
            <img 
              src={logoImg} 
              alt="Huncho TV" 
              className="h-10 xs:h-12 sm:h-14 md:h-16 w-auto max-w-[200px] xs:max-w-[250px] sm:max-w-[320px] md:max-w-[380px] object-contain transition-transform hover:scale-102 filter drop-shadow-xs" 
            />
            {user?.is_pro && (
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectProfile?.();
                }}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 bg-gradient-to-r from-amber-500/15 via-yellow-500/25 to-amber-500/15 border border-amber-400/60 rounded-full text-amber-900 text-[10px] font-black tracking-wide shadow-2xs hover:scale-105 transition-transform"
                title="VIP PRO Membership Active"
              >
                <Crown className="w-3 h-3 text-amber-600 fill-amber-500 animate-pulse" />
                <span>VIP PRO</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {user?.is_pro && (
              <div 
                onClick={onSelectProfile}
                className="sm:hidden inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-300 rounded-full text-amber-800 text-[9px] font-extrabold cursor-pointer"
              >
                <Crown className="w-2.5 h-2.5 text-amber-500 fill-amber-400" />
                <span>VIP</span>
              </div>
            )}

            {/* Quick Watchlist & Download shortcuts (Desktop/Tablet only to keep mobile header clean) */}
            <button
              onClick={onSelectWatchlist}
              aria-label="My Watchlist"
              className={`hidden md:flex p-2 rounded-full transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                activeTab === 'watchlist' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              title="My Watchlist"
            >
              <Bookmark className="w-5 h-5" />
              {watchlist.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600 border border-white" />
              )}
            </button>

            <button
              onClick={onSelectDownloads}
              aria-label="My Downloads"
              className={`hidden md:flex p-2 rounded-full transition-colors relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${
                activeTab === 'downloads' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
              title="My Downloads"
            >
              <Download className="w-5 h-5" />
              {downloads.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-600 border border-white" />
              )}
            </button>

            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search movies and TV shows"
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              aria-label="App settings"
              className="hidden p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            <div className="relative">
              <button
                onClick={onSelectProfile}
                aria-label="Profile and Account"
                className={`p-1 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  user?.is_pro 
                    ? 'ring-2 ring-amber-400 shadow-sm shadow-amber-300/40 bg-amber-50 focus:ring-amber-500' 
                    : activeTab === 'profile' ? 'ring-2 ring-indigo-600 focus:ring-indigo-600' : 'hover:ring-2 hover:ring-slate-300 focus:ring-indigo-600'
                }`}
                title={user?.is_pro ? "Profile (VIP PRO Active)" : "Profile & Account"}
              >
                {user?.avatar_url && user.avatar_url.trim() !== "" ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || "Profile"}
                    className="w-7 h-7 rounded-full object-cover bg-indigo-100"
                  />
                ) : (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    user?.is_pro ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-700"
                  }`}>
                    <User className="w-4 h-4" />
                  </div>
                )}
              </button>
              {user?.is_pro && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full p-0.5 shadow-2xs border border-white">
                  <Crown className="w-2.5 h-2.5 fill-current text-white" />
                </span>
              )}
            </div>
          </div>
        </div>
      </nav>


      {/* Settings Modal */}
      <Suspense fallback={null}>
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </Suspense>

      {/* Search Modal */}
      {isSearchOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="Search movies and TV shows"
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsSearchOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex justify-center p-4 pt-[10vh]"
        >
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh] border border-slate-100 focus:outline-none">
            <div className="flex items-center px-4 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search movies, tv shows..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-4 text-lg outline-none text-slate-900 placeholder:text-slate-400 bg-transparent focus:ring-0"
              />
              <button 
                onClick={() => setIsSearchOpen(false)} 
                aria-label="Close search overlay"
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2">
              {results.length > 0 ? (
                results.map((movie, idx) => (
                  <div
                    key={`${movie.id}-${idx}`}
                    onClick={() => {
                      const detectedType = movie.media_type || ((movie as any).first_air_date ? "tv" : "movie");
                      setSelectedMovieId(movie.id, detectedType);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                  >
                    <SearchItemPoster movie={movie} />
                    <div>
                      <h4 className="font-bold text-slate-900">{movie.title || movie.original_title}</h4>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <span>{movie.release_date?.slice(0, 4)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-400 inline-block mx-1" />
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{movie.vote_average?.toFixed(1)}</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : query.length > 0 ? (
                <div className="p-8 text-center text-slate-500">No results found for "{query}"</div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">Start typing to search...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
