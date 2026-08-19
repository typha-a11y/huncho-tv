import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Radio, 
  Tv, 
  Trophy, 
  Bell, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  ShieldCheck, 
  Globe, 
  Activity,
  ExternalLink,
  ChevronRight,
  Zap,
  Info,
  Search,
  RefreshCw,
  Clock,
  Filter,
  SlidersHorizontal,
  Flame
} from "lucide-react";
import { AnimatedFlame } from "./AnimatedFlame";
import { useStore } from "../lib/store";
import { INITIAL_FIXTURES } from "../lib/sportsData";
import { Fixture, SportCategory, FixtureStatus } from "../types/sports";
import { MatchCenterModal } from "./MatchCenterModal";

interface LiveSportsViewProps {
  onExplore?: () => void;
}

export function LiveSportsView({ onExplore }: LiveSportsViewProps) {
  const [fixtures, setFixtures] = useState<Fixture[]>(INITIAL_FIXTURES);
  const [selectedSport, setSelectedSport] = useState<SportCategory>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFixture, setActiveFixture] = useState<Fixture | null>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [reminders, setReminders] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("Just now");
  const [selectedChannelCategory, setSelectedChannelCategory] = useState("All");

  const setVideoPlayerOpen = useStore((s) => s.setVideoPlayerOpen);

  // Load reminders from localStorage
  useEffect(() => {
    try {
      const savedReminders = localStorage.getItem("hunchotv_fixture_reminders");
      if (savedReminders) {
        setReminders(JSON.parse(savedReminders));
      }
    } catch (e) {
      console.warn("Could not load reminders", e);
    }
  }, []);

  // Save reminders to localStorage
  const handleToggleReminder = (fixtureId: string) => {
    let updated: string[];
    const isCurrentlyReminded = reminders.includes(fixtureId);
    if (isCurrentlyReminded) {
      updated = reminders.filter((id) => id !== fixtureId);
      showToast("🔔 Kickoff reminder removed");
    } else {
      updated = [...reminders, fixtureId];
      showToast("🔔 Match kickoff notification scheduled! We'll alert you 10 mins before kickoff.");
    }
    setReminders(updated);
    try {
      localStorage.setItem("hunchotv_fixture_reminders", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save reminders", e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Refresh live scores simulation
  const handleRefreshScores = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      showToast("⚡ Match scores & live clocks updated to real-time sync!");
    }, 600);
  };

  // Launch direct in video player
  const handleLaunchFixtureStream = (fix: Fixture, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const channelSlug = fix.channel_slug || fix.slug || fix.id;
    setVideoPlayerOpen(true, fix.streamUrl, fix.title, {
      isLiveStream: true,
      title: fix.title,
      category: fix.league,
      streamType: "direct_hls",
      channelSlug
    });
  };

  const handleOpenMatchCenter = (fix: Fixture) => {
    setActiveFixture(fix);
    setIsMatchModalOpen(true);
  };

  const handleLaunchChannel = (chan: any) => {
    const channelSlug = chan.channel_slug || chan.slug || chan.id;
    setVideoPlayerOpen(true, chan.streamUrl, chan.name, {
      isLiveStream: true,
      title: chan.name,
      category: "Live TV",
      streamType: "direct_hls",
      channelSlug: channelSlug
    });
  };

  const handleLaunchSource = (source: any) => {
    const channelSlug = source.channel_slug || source.slug || source.id;
    setVideoPlayerOpen(true, source.streamUrl, source.name, {
      isLiveStream: true,
      title: source.name,
      category: "Live TV",
      streamType: "direct_hls",
      channelSlug: channelSlug
    });
  };

  // Filtered fixtures
  const filteredFixtures = useMemo(() => {
    return fixtures.filter((fix) => {
      // Sport filter
      if (selectedSport !== "All" && fix.sport !== selectedSport) {
        return false;
      }
      // Status filter
      if (selectedStatus === "LIVE" && !fix.isLive) return false;
      if (selectedStatus === "UPCOMING" && fix.status !== "UPCOMING") return false;
      if (selectedStatus === "FINISHED" && fix.status !== "FINISHED") return false;
      if (selectedStatus === "REMINDED" && !reminders.includes(fix.id)) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = fix.title.toLowerCase().includes(q);
        const matchHome = fix.homeTeam.name.toLowerCase().includes(q);
        const matchAway = fix.awayTeam.name.toLowerCase().includes(q);
        const matchLeague = fix.league.toLowerCase().includes(q);
        if (!matchTitle && !matchHome && !matchAway && !matchLeague) return false;
      }

      return true;
    });
  }, [fixtures, selectedSport, selectedStatus, searchQuery, reminders]);

  const liveCount = fixtures.filter((f) => f.isLive).length;
  const upcomingCount = fixtures.filter((f) => f.status === "UPCOMING").length;

  // Middle Section: More Live Sources
  const liveSources = [
    {
      id: "src-1",
      slug: "bexytv-mirror",
      channel_slug: "bexytv-mirror",
      name: "BexyTV Sports Mirror",
      badge: "DIRECT CDN",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-300",
      description: "Ultra low-latency HLS stream mirror for live football & NBA",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=bexytv-mirror",
      icon: "🚀"
    },
    {
      id: "src-2",
      slug: "freegotv-relay",
      channel_slug: "freegotv-relay",
      name: "FreeGoTV Live Relay",
      badge: "SATELLITE",
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-300",
      description: "Free 1080p satellite feed relay for global sports & 24/7 TV",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=freegotv-relay",
      icon: "📡"
    },
    {
      id: "src-3",
      slug: "streameast-backup",
      channel_slug: "streameast-backup",
      name: "StreamEast Backup CDN",
      badge: "COMBAT & F1",
      badgeColor: "bg-amber-500/10 text-amber-700 border-amber-300",
      description: "Multi-angle HD stream backup for UFC, Boxing & Formula 1",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=streameast-backup",
      icon: "⚡"
    }
  ];

  // Bottom Grid Section: 24/7 Live Channels
  const channelCategories = ["All", "Sports", "Entertainment", "News", "Movies", "Kids"];

  const channels = [
    {
      id: "chan-espn",
      slug: "espn-hd",
      channel_slug: "espn-hd",
      name: "ESPN HD",
      category: "Sports",
      quality: "1080p 60fps",
      gradient: "from-red-600 to-rose-800",
      logoText: "ESPN",
      logoBg: "bg-red-600",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_wordmark.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-espn"
    },
    {
      id: "chan-cbs-sports",
      slug: "cbs-sports",
      channel_slug: "cbs-sports",
      name: "CBS Sports Network",
      category: "Sports",
      quality: "1080p HD",
      gradient: "from-blue-700 to-indigo-900",
      logoText: "CBS SPORTS",
      logoBg: "bg-blue-700",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1a/CBS_Sports_Network_logo.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-cbssports"
    },
    {
      id: "chan-fs1",
      slug: "fs1",
      channel_slug: "fs1",
      name: "FS1 (Fox Sports 1)",
      category: "Sports",
      quality: "1080p HD",
      gradient: "from-sky-700 to-blue-900",
      logoText: "FS1",
      logoBg: "bg-blue-900",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/Fox_Sports_1_logo.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-fs1"
    },
    {
      id: "chan-sky-sports",
      slug: "sky-sports-pl",
      channel_slug: "sky-sports-pl",
      name: "Sky Sports Premier League",
      category: "Sports",
      quality: "4K Ultra",
      gradient: "from-red-700 to-blue-900",
      logoText: "SKY SPORTS",
      logoBg: "bg-red-700",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/37/Sky_Sports_logo_2020.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-skysports"
    },
    {
      id: "chan-supersport",
      slug: "supersport-grandstand",
      channel_slug: "supersport-grandstand",
      name: "SuperSport Grandstand",
      category: "Sports",
      quality: "1080p HD",
      gradient: "from-indigo-600 to-purple-900",
      logoText: "SUPERSPORT",
      logoBg: "bg-indigo-600",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/87/SuperSport_logo.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-supersport"
    },
    {
      id: "chan-eurosport",
      slug: "eurosport-1",
      channel_slug: "eurosport-1",
      name: "Eurosport 1",
      category: "Sports",
      quality: "1080p HD",
      gradient: "from-[#0A192F] to-blue-950",
      logoText: "EUROSPORT",
      logoBg: "bg-blue-950",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f6/Eurosport_1_logo_2015.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-eurosport"
    },
    {
      id: "chan-bbc-news",
      slug: "bbc-news-hd",
      channel_slug: "bbc-news-hd",
      name: "BBC News HD",
      category: "News",
      quality: "1080p HD",
      gradient: "from-red-800 to-stone-900",
      logoText: "BBC NEWS",
      logoBg: "bg-red-800",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/62/BBC_News_2022.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-bbcnews"
    },
    {
      id: "chan-cnn",
      slug: "cnn-international",
      channel_slug: "cnn-international",
      name: "CNN International",
      category: "News",
      quality: "1080p HD",
      gradient: "from-red-700 to-red-950",
      logoText: "CNN",
      logoBg: "bg-red-700",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-cnn"
    },
    {
      id: "chan-hbo",
      slug: "hbo-signature",
      channel_slug: "hbo-signature",
      name: "HBO Signature",
      category: "Movies",
      quality: "1080p HD",
      gradient: "from-slate-900 to-indigo-950",
      logoText: "HBO",
      logoBg: "bg-black",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-hbo"
    },
    {
      id: "chan-cinema",
      slug: "cinemax-action",
      channel_slug: "cinemax-action",
      name: "Cinemax Action HD",
      category: "Movies",
      quality: "1080p HD",
      gradient: "from-amber-700 to-orange-950",
      logoText: "CINEMAX",
      logoBg: "bg-amber-700",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/87/Cinemax_2011_logo.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-cinemax"
    },
    {
      id: "chan-disney",
      slug: "disney-channel",
      channel_slug: "disney-channel",
      name: "Disney Channel",
      category: "Kids",
      quality: "1080p HD",
      gradient: "from-blue-600 to-sky-800",
      logoText: "DISNEY",
      logoBg: "bg-blue-600",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d2/Disney_Channel_logo.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-disney"
    },
    {
      id: "chan-e-ent",
      slug: "e-entertainment",
      channel_slug: "e-entertainment",
      name: "E! Entertainment",
      category: "Entertainment",
      quality: "1080p HD",
      gradient: "from-neutral-900 to-stone-950",
      logoText: "E! ENTERTAINMENT",
      logoBg: "bg-black",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5e/E%21_logo.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-e-entertainment"
    }
  ];

  const filteredChannels = selectedChannelCategory === "All"
    ? channels
    : channels.filter((c) => c.category === selectedChannelCategory);

  return (
    <div className="w-full space-y-7 text-slate-900">
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 left-4 md:left-auto md:right-8 md:max-w-md z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/50 flex items-start gap-3 backdrop-blur-xl"
          >
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                Sports Center Alert
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {toastMessage}
              </p>
            </div>
            <button 
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. TOP HERO SECTION: "Live & Upcoming Fixtures" */}
      <div className="space-y-4">
        {/* Header with Title, Live Badge, and Score Sync Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-2xl">
              <AnimatedFlame className="w-5 h-5 text-rose-600 fill-rose-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Live & Upcoming Fixtures
                </h2>
                {liveCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    {liveCount} LIVE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Real-time scores, lineups, fan predictions & direct live stream playback
              </p>
            </div>
          </div>

          {/* Action Tools: Refresh Scores & Notification Count */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshScores}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Sync latest live match scores & game clocks"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden xs:inline">Sync Scores</span>
              <span className="text-[10px] text-slate-500 font-normal">({lastUpdated})</span>
            </button>

            {reminders.length > 0 && (
              <button
                onClick={() => setSelectedStatus("REMINDED")}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{reminders.length} Reminders</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls: Search & Status Pills & Sport Category Tabs */}
        <div className="space-y-2.5 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* Row 1: Search and Status Badges */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search team, derby, or league (e.g. Arsenal, Simba, Lakers, Clásico)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar shrink-0">
              <button
                onClick={() => setSelectedStatus("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedStatus === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All ({fixtures.length})
              </button>

              <button
                onClick={() => setSelectedStatus("LIVE")}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  selectedStatus === "LIVE"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                Live ({liveCount})
              </button>

              <button
                onClick={() => setSelectedStatus("UPCOMING")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedStatus === "UPCOMING"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Upcoming ({upcomingCount})
              </button>

              <button
                onClick={() => setSelectedStatus("FINISHED")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedStatus === "FINISHED"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Results / FT
              </button>
            </div>
          </div>

          {/* Row 2: Sport Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 hide-scrollbar border-t border-slate-100">
            {(["All", "Football", "Basketball", "Motorsport", "Combat"] as SportCategory[]).map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedSport === sport
                    ? "bg-indigo-50 text-indigo-600 border border-indigo-200 font-extrabold"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {sport === "All" && "⚡ All Sports"}
                {sport === "Football" && "⚽ Football (Soccer)"}
                {sport === "Basketball" && "🏀 Basketball"}
                {sport === "Motorsport" && "🏎️ Formula 1"}
                {sport === "Combat" && "🥊 UFC & Boxing"}
              </button>
            ))}
          </div>
        </div>

        {/* Fixtures Carousel / Cards Grid */}
        {filteredFixtures.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200 p-8 space-y-3">
            <p className="text-slate-600 font-bold text-sm">No matches found for your filter criteria.</p>
            <button
              onClick={() => {
                setSelectedSport("All");
                setSelectedStatus("ALL");
                setSearchQuery("");
              }}
              className="text-xs font-extrabold text-indigo-600 hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {filteredFixtures.map((fix) => {
              const isReminded = reminders.includes(fix.id);
              return (
                <div
                  key={fix.id}
                  onClick={() => handleOpenMatchCenter(fix)}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-xl transition-all p-4 cursor-pointer flex flex-col justify-between space-y-3 group hover:border-indigo-300 relative overflow-hidden"
                >
                  {/* Top Header: League, Status, Reminder Bell */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-extrabold text-slate-600 tracking-tight uppercase truncate">
                        {fix.league}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {!fix.isLive && fix.status === "UPCOMING" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleReminder(fix.id);
                          }}
                          className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            isReminded
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-500"
                          }`}
                          title={isReminded ? "Notification active" : "Set match reminder"}
                        >
                          <Bell className={`w-3.5 h-3.5 ${isReminded ? "fill-amber-500 text-amber-500" : ""}`} />
                        </button>
                      )}

                      {fix.isLive ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          LIVE
                        </span>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wider ${
                          fix.status === "FINISHED" ? "bg-slate-100 text-slate-600" : "bg-indigo-50 text-indigo-700"
                        }`}>
                          {fix.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Team vs Team Layout with Scores / VS */}
                  <div className="flex items-center justify-between gap-3 py-1 px-1">
                    {/* Home Team */}
                    <div className="flex flex-col items-center text-center space-y-1.5 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-center p-1.5 overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                        <img 
                          src={fix.homeTeam.logo} 
                          alt={fix.homeTeam.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            if ((e.target as HTMLElement).parentElement) {
                              (e.target as HTMLElement).parentElement!.innerText = fix.homeTeam.short;
                            }
                          }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-900 truncate max-w-[105px]">
                        {fix.homeTeam.name}
                      </span>
                    </div>

                    {/* Score / Center Info */}
                    <div className="flex flex-col items-center justify-center shrink-0 px-2">
                      {fix.status === "LIVE" || fix.status === "FINISHED" ? (
                        <div className="flex items-center gap-2 font-black text-xl sm:text-2xl text-slate-900 tracking-tight">
                          <span>{fix.homeTeam.score ?? 0}</span>
                          <span className="text-slate-400 text-base">-</span>
                          <span>{fix.awayTeam.score ?? 0}</span>
                        </div>
                      ) : (
                        <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                          VS
                        </span>
                      )}
                      
                      <span className={`text-[10px] font-extrabold mt-1 ${
                        fix.isLive ? "text-rose-600 font-black animate-pulse" : "text-slate-500"
                      }`}>
                        {fix.time}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center text-center space-y-1.5 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-center p-1.5 overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                        <img 
                          src={fix.awayTeam.logo} 
                          alt={fix.awayTeam.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                            if ((e.target as HTMLElement).parentElement) {
                              (e.target as HTMLElement).parentElement!.innerText = fix.awayTeam.short;
                            }
                          }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-900 truncate max-w-[105px]">
                        {fix.awayTeam.name}
                      </span>
                    </div>
                  </div>

                  {/* Footer Actions: Match Center & Direct Play */}
                  <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleOpenMatchCenter(fix)}
                      className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Activity className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Match Center & Stats</span>
                    </button>

                    <button
                      onClick={(e) => handleLaunchFixtureStream(fix, e)}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all shrink-0"
                      title="Watch Live Stream"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{fix.isLive ? "Watch Live" : "Stream Feed"}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. MIDDLE SECTION: "More Live Sources" */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-xl">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                More Live Sources
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                High bitrate backup stream mirrors & CDN satellite feeds
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {liveSources.map((source) => (
            <div
              key={source.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-lg">{source.icon}</span>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${source.badgeColor}`}>
                    {source.badge}
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-900 text-sm">{source.name}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {source.description}
                </p>
              </div>

              <button
                onClick={() => handleLaunchSource(source)}
                className="w-full py-2 bg-slate-900 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Launch Mirror</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. BOTTOM GRID SECTION: "24/7 Live Channels" */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-xl">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                24/7 Live Channels
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tap any channel logo to open HLS stream in Huncho Player
              </p>
            </div>
          </div>

          {/* Category Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full hide-scrollbar">
            {channelCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedChannelCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedChannelCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Grid: 2 columns on mobile, 4-6 columns on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredChannels.map((chan) => (
            <div
              key={chan.id}
              onClick={() => handleLaunchChannel(chan)}
              className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl overflow-hidden p-3 flex flex-col justify-between space-y-2.5 transition-all cursor-pointer border-b-2 border-b-slate-200 group-hover:border-b-indigo-600"
            >
              {/* Channel Logo Container with Gradient/Subtle Background */}
              <div className={`relative aspect-video w-full rounded-xl bg-gradient-to-br ${chan.gradient} flex items-center justify-center p-3 shadow-inner overflow-hidden`}>
                <img
                  src={chan.logoUrl}
                  alt={chan.name}
                  className="max-h-10 max-w-[80%] object-contain filter drop-shadow-md brightness-0 invert group-hover:scale-110 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                    if ((e.target as HTMLElement).parentElement) {
                      const textEl = document.createElement("span");
                      textEl.className = "text-white font-black text-xs uppercase tracking-wider text-center drop-shadow-sm";
                      textEl.innerText = chan.logoText;
                      (e.target as HTMLElement).parentElement!.appendChild(textEl);
                    }
                  }}
                />

                {/* Live Badge Overlay */}
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-rose-600/90 text-white font-black text-[9px] uppercase tracking-wider">
                  LIVE
                </span>

                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white font-bold text-[9px]">
                  {chan.quality}
                </span>
              </div>

              {/* Channel Meta */}
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-tight block">
                  {chan.category}
                </span>
                <h4 className="font-bold text-slate-900 text-xs truncate group-hover:text-indigo-600 transition-colors">
                  {chan.name}
                </h4>
              </div>

              {/* Play Action */}
              <button className="w-full py-1.5 bg-slate-50 group-hover:bg-indigo-600 group-hover:text-white text-slate-700 rounded-lg text-[11px] font-extrabold flex items-center justify-center gap-1 transition-colors">
                <Play className="w-3 h-3 fill-current" />
                <span>Watch</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Info Footer Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-300 font-medium">
            All streams are routed through encrypted HLS proxy gateways with automatic failover to backup satellite sources.
          </p>
        </div>
        <button
          onClick={handleRefreshScores}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shrink-0 transition-colors cursor-pointer"
        >
          Check Stream Status
        </button>
      </div>

      {/* Interactive Match Center Modal */}
      <MatchCenterModal
        fixture={activeFixture}
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        isReminded={activeFixture ? reminders.includes(activeFixture.id) : false}
        onToggleReminder={handleToggleReminder}
      />
    </div>
  );
}
