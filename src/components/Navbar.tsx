import { useState, useEffect, lazy, Suspense } from "react";
import { Search, User, Settings, Bookmark, Download, Crown, Sparkles } from "lucide-react";
import { useStore } from "../lib/store";
import logoImg from "../assets/logo.png";
import { SearchAutocompleteModal } from "./SearchAutocompleteModal";
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

export function Navbar({ 
  onSelectDiscover, 
  onSelectLiveSports, 
  onSelectZilizotafsiriwa, 
  onSelectWatchlist, 
  onSelectDownloads, 
  onSelectProfile, 
  activeTab 
}: NavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const watchlist = useStore((s) => s.watchlist);
  const downloads = useStore((s) => s.downloads);
  const user = useStore((s) => s.user);

  // Global Keyboard shortcut listener for Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 xs:px-5 sm:px-6 md:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo & VIP Crown */}
          <div onClick={onSelectDiscover} className="flex items-center gap-2.5 cursor-pointer shrink-0 py-1">
            <img 
              src={logoImg} 
              alt="Huncho TV" 
              className="h-10 xs:h-12 sm:h-14 md:h-16 w-auto max-w-[190px] xs:max-w-[240px] sm:max-w-[300px] md:max-w-[340px] object-contain transition-transform hover:scale-102 filter drop-shadow-xs" 
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

          {/* Desktop/Tablet Expandable Quick Search Input Pill */}
          <div 
            onClick={() => setIsSearchOpen(true)}
            className="hidden sm:flex flex-1 max-w-md items-center justify-between px-3.5 py-2 bg-slate-100/80 hover:bg-slate-100 border border-slate-200/70 hover:border-indigo-300 rounded-full text-xs text-slate-500 cursor-pointer shadow-2xs transition-all group"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
              <span className="truncate group-hover:text-slate-700">Search movies, series, or live derbies...</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="hidden md:inline-flex items-center gap-0.5 px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500 shadow-2xs font-bold">
                ⌘K
              </span>
            </div>
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

            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search movies and TV shows"
              className="sm:hidden p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
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

      {/* Modern Trending & Autocomplete Search Overlay */}
      <SearchAutocompleteModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectLiveSports={onSelectLiveSports}
        onSelectZilizotafsiriwa={onSelectZilizotafsiriwa}
      />
    </>
  );
}

