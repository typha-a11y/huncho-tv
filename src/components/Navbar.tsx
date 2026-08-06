import { useState, useEffect } from "react";
import { Search, User, PlayCircle, X, Star, Settings, Bookmark } from "lucide-react";
import { searchMulti, getImageUrl } from "../lib/api";
import { Movie } from "../types";
import { useStore } from "../lib/store";
import { SettingsModal } from "./SettingsModal";

interface NavbarProps {
  onSelectDiscover?: () => void;
  onSelectWatchlist?: () => void;
  activeTab?: string | number;
}

export function Navbar({ onSelectDiscover, onSelectWatchlist, activeTab }: NavbarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const setSelectedMovieId = useStore((s) => s.setSelectedMovieId);
  const watchlist = useStore((s) => s.watchlist);

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
      <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 md:px-8 h-16 flex items-center justify-between">
          <div onClick={onSelectDiscover} className="flex items-center gap-2 cursor-pointer">
            <PlayCircle className="w-8 h-8 text-indigo-500" />
            <span className="text-xl font-bold text-slate-900 tracking-tight">HUNCHO TV</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button 
              onClick={onSelectDiscover} 
              className={`hover:text-indigo-600 transition-colors cursor-pointer ${activeTab === 'home' || activeTab === 'discover' ? 'text-indigo-600 font-bold' : ''}`}
            >
              Discover
            </button>
            <button 
              onClick={onSelectWatchlist} 
              className={`hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1.5 ${activeTab === 'watchlist' ? 'text-indigo-600 font-bold' : ''}`}
            >
              <span>My Watchlist</span>
              {watchlist.length > 0 && (
                <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-700 px-1.5 py-0.2 rounded-full">
                  {watchlist.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onSelectWatchlist}
              className={`p-2 rounded-full transition-colors relative cursor-pointer ${
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
              onClick={() => setIsSearchOpen(true)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex items-center gap-2 cursor-pointer"
              title="Search"
            >
              <Search className="w-5 h-5" />
              <span className="hidden md:inline text-sm font-medium border border-slate-200 px-2 py-0.5 rounded-md bg-white">⌘ K</span>
            </button>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Settings Modal */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-sm flex justify-center p-4 pt-[10vh]">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[80vh] border border-slate-100">
            <div className="flex items-center px-4 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                autoFocus
                type="text"
                placeholder="Search movies, tv shows..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full px-4 py-4 text-lg outline-none text-slate-900 placeholder:text-slate-400 bg-transparent"
              />
              <button onClick={() => setIsSearchOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1 p-2">
              {results.length > 0 ? (
                results.map((movie) => (
                  <div
                    key={movie.id}
                    onClick={() => {
                      setSelectedMovieId(movie.id);
                      setIsSearchOpen(false);
                    }}
                    className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
                  >
                    <img
                      src={getImageUrl(movie.poster_path, "w500")}
                      alt={movie.title || movie.original_title}
                      className="w-12 h-16 object-cover rounded-md shadow-sm"
                    />
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
