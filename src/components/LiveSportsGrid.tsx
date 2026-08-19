import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Play, 
  X, 
  RefreshCw, 
  Search, 
  AlertCircle, 
  Maximize2, 
  Minimize2,
  ExternalLink,
  Radio,
  Activity,
  CheckCircle2,
  Tv,
  Clock,
  Flame,
  Sparkles,
  Shield,
  Layers,
  ChevronRight
} from "lucide-react";

export type SportCategory = 
  | "All" 
  | "Football" 
  | "Basketball" 
  | "Formula 1" 
  | "Combat";

export interface FixtureItem {
  id: string | number;
  title: string;
  league: string;
  sport: SportCategory;
  details?: string | null;
  stream_url?: string | null;
  status: "LIVE" | "UPCOMING" | "FINISHED";
  time: string;
  isLive: boolean;
  homeTeam: {
    name: string;
    short: string;
    logo: string;
    score?: number;
  };
  awayTeam: {
    name: string;
    short: string;
    logo: string;
    score?: number;
  };
  venue?: string;
  stats?: {
    label: string;
    home: number | string;
    away: number | string;
  }[];
  votes?: {
    home: number;
    draw: number;
    away: number;
  };
}

interface RawApiFixtureItem {
  id?: string | number;
  title?: string;
  name?: string;
  details?: string | null;
  stream_url?: string | null;
  url?: string | null;
  time?: string | null;
  league?: string | null;
  sport?: string | null;
  status?: string | null;
  is_live?: boolean;
}

interface ApiResponsePayload {
  status?: string;
  count?: number;
  data?: RawApiFixtureItem[];
  fixtures?: RawApiFixtureItem[];
}

interface ResolutionResponse {
  status: string;
  embed_url?: string | null;
  message?: string | null;
}

const BACKEND_API_BASE = "https://huncho-tv-backend.onrender.com";

/**
 * Intelligent helper to parse raw API event data dynamically into structured FixtureItem
 */
function parseRawApiEvent(item: RawApiFixtureItem, index: number): FixtureItem {
  const rawTitle = (item.title || item.name || "Live Match").trim();
  const rawDetails = (item.details || item.time || "").trim();
  const streamUrl = item.stream_url || item.url || "";
  const lowerTitle = rawTitle.toLowerCase();
  const lowerDetails = rawDetails.toLowerCase();

  // 1. Detect Sport Category
  let sport: SportCategory = "Football";
  if (
    lowerTitle.includes("nba") || 
    lowerTitle.includes("basketball") || 
    lowerTitle.includes("lakers") || 
    lowerTitle.includes("celtics") || 
    lowerTitle.includes("warriors") || 
    lowerDetails.includes("nba") ||
    lowerDetails.includes("basketball")
  ) {
    sport = "Basketball";
  } else if (
    lowerTitle.includes("f1") || 
    lowerTitle.includes("formula 1") || 
    lowerTitle.includes("grand prix") || 
    lowerTitle.includes("qualifying") || 
    lowerDetails.includes("f1") ||
    lowerDetails.includes("formula 1")
  ) {
    sport = "Formula 1";
  } else if (
    lowerTitle.includes("ufc") || 
    lowerTitle.includes("boxing") || 
    lowerTitle.includes("fight") || 
    lowerTitle.includes("mma") || 
    lowerTitle.includes("bellator") ||
    lowerDetails.includes("ufc") ||
    lowerDetails.includes("boxing")
  ) {
    sport = "Combat";
  }

  // 2. Detect League / Competition
  let league = "LIVE FIXTURE";
  if (sport === "Basketball") league = "NBA BASKETBALL";
  else if (sport === "Formula 1") league = "FORMULA 1 WORLD CHAMPIONSHIP";
  else if (sport === "Combat") league = "UFC / COMBAT SPORTS";
  else if (lowerTitle.includes("premier league") || lowerDetails.includes("premier league")) league = "PREMIER LEAGUE";
  else if (lowerTitle.includes("champions league") || lowerDetails.includes("champions league") || lowerDetails.includes("ucl")) league = "UEFA CHAMPIONS LEAGUE";
  else if (lowerTitle.includes("la liga") || lowerDetails.includes("la liga")) league = "LA LIGA SANTANDER";
  else if (lowerTitle.includes("serie a") || lowerDetails.includes("serie a")) league = "SERIE A TIM";
  else if (lowerTitle.includes("bundesliga") || lowerDetails.includes("bundesliga")) league = "BUNDESLIGA";
  else if (lowerTitle.includes("ligue 1") || lowerDetails.includes("ligue 1")) league = "LIGUE 1 MCDONALD'S";
  else if (lowerTitle.includes("nbc") || lowerTitle.includes("simba") || lowerTitle.includes("yanga") || lowerDetails.includes("nbc")) league = "NBC PREMIER LEAGUE (TZ)";
  else if (rawDetails && !rawDetails.includes(":") && rawDetails.length < 30) {
    league = rawDetails.toUpperCase();
  }

  // 3. Detect Live / Upcoming / Finished Status
  const isExplicitLive = item.is_live === true || 
    lowerDetails.includes("live") || 
    lowerDetails.includes("'") || 
    lowerDetails.includes("min") || 
    lowerDetails.includes("ht") || 
    lowerDetails.includes("half") || 
    lowerDetails.includes("q1") || 
    lowerDetails.includes("q2") || 
    lowerDetails.includes("q3") || 
    lowerDetails.includes("q4") || 
    lowerTitle.includes("live");

  const isFinished = lowerDetails.includes("ft") || 
    lowerDetails.includes("full time") || 
    lowerDetails.includes("ended") || 
    lowerTitle.includes("ft");

  const status: "LIVE" | "UPCOMING" | "FINISHED" = isExplicitLive 
    ? "LIVE" 
    : isFinished 
    ? "FINISHED" 
    : "UPCOMING";

  const isLive = status === "LIVE";

  // 4. Parse Team Names from Title
  let cleanTitle = rawTitle
    .replace(/^live\s*:\s*/i, "")
    .replace(/\[live\]/i, "")
    .replace(/\(live\)/i, "")
    .trim();

  let homeName = "Home Team";
  let awayName = "Away Team";

  if (cleanTitle.includes(" vs ")) {
    const parts = cleanTitle.split(" vs ");
    homeName = parts[0].trim();
    awayName = parts[1].trim();
  } else if (cleanTitle.includes(" vs. ")) {
    const parts = cleanTitle.split(" vs. ");
    homeName = parts[0].trim();
    awayName = parts[1].trim();
  } else if (cleanTitle.includes(" v ")) {
    const parts = cleanTitle.split(" v ");
    homeName = parts[0].trim();
    awayName = parts[1].trim();
  } else if (cleanTitle.includes(" - ")) {
    const parts = cleanTitle.split(" - ");
    homeName = parts[0].trim();
    awayName = parts[1].trim();
  } else if (cleanTitle.includes(" @ ")) {
    const parts = cleanTitle.split(" @ ");
    homeName = parts[1].trim();
    awayName = parts[0].trim();
  } else {
    homeName = cleanTitle;
    awayName = "Opponent";
  }

  // Helper for short code
  const getShortCode = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
      return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    }
    return name.slice(0, 3).toUpperCase();
  };

  const homeShort = getShortCode(homeName);
  const awayShort = getShortCode(awayName);

  // Time string formatting
  let displayTime = "UPCOMING";
  if (isLive) {
    if (rawDetails && (rawDetails.includes("'") || rawDetails.toLowerCase().includes("min"))) {
      displayTime = rawDetails;
    } else {
      displayTime = "LIVE NOW";
    }
  } else if (isFinished) {
    displayTime = "FT";
  } else if (rawDetails) {
    displayTime = rawDetails;
  } else {
    displayTime = "TODAY";
  }

  const generatedId = item.id !== undefined && item.id !== null ? String(item.id) : `fixture-${index}`;

  return {
    id: generatedId,
    title: rawTitle,
    league,
    sport,
    details: rawDetails || null,
    stream_url: streamUrl,
    status,
    time: displayTime,
    isLive,
    homeTeam: {
      name: homeName,
      short: homeShort,
      logo: `https://avatar.vercel.sh/${encodeURIComponent(homeName)}.svg?text=${encodeURIComponent(homeShort.slice(0, 2))}&size=100`,
      score: undefined
    },
    awayTeam: {
      name: awayName,
      short: awayShort,
      logo: `https://avatar.vercel.sh/${encodeURIComponent(awayName)}.svg?text=${encodeURIComponent(awayShort.slice(0, 2))}&size=100`,
      score: undefined
    },
    venue: "Live Arena",
    stats: [
      { label: "Possession", home: "50%", away: "50%" },
      { label: "Shots on Target", home: 0, away: 0 },
      { label: "Corner Kicks", home: 0, away: 0 }
    ],
    votes: { home: 50, draw: 20, away: 50 }
  };
}

export function LiveSportsGrid() {
  const [fixtures, setFixtures] = useState<FixtureItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSport, setSelectedSport] = useState<SportCategory>("All");
  const [selectedStatus, setSelectedStatus] = useState<"ALL" | "LIVE" | "UPCOMING" | "FINISHED">("ALL");

  // Stream Resolution & Playback Modal State
  const [activePlaybackFixture, setActivePlaybackFixture] = useState<FixtureItem | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [resolvingId, setResolvingId] = useState<string | number | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Match Center Modal State
  const [activeMatchCenterFixture, setActiveMatchCenterFixture] = useState<FixtureItem | null>(null);
  const [isMatchCenterOpen, setIsMatchCenterOpen] = useState<boolean>(false);
  const [matchCenterTab, setMatchCenterTab] = useState<"stats" | "lineup" | "poll">("stats");
  const [userPollVote, setUserPollVote] = useState<"home" | "draw" | "away" | null>(null);

  // =========================================================================
  // 1. PURE API FETCHING (EXCLUSIVELY FROM BACKEND - ZERO MOCK DATA)
  // =========================================================================
  const fetchFixtures = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const response = await fetch(`${BACKEND_API_BASE}/api/v1/fixtures`, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const resData: ApiResponsePayload | RawApiFixtureItem[] = await response.json();
      
      let rawList: RawApiFixtureItem[] = [];
      if (Array.isArray(resData)) {
        rawList = resData;
      } else if (resData && Array.isArray(resData.data)) {
        rawList = resData.data;
      } else if (resData && Array.isArray(resData.fixtures)) {
        rawList = resData.fixtures;
      }

      if (rawList.length > 0) {
        const parsedFixtures = rawList.map((item, idx) => parseRawApiEvent(item, idx));
        setFixtures(parsedFixtures);
      } else {
        setFixtures([]);
      }
    } catch (err: any) {
      console.error("Error fetching live sports fixtures:", err);
      setFetchError(err?.message || "Unable to reach FawaNews live feed server.");
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFixtures();
  }, [fetchFixtures]);

  // Keyboard accessibility for modals (ESC key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isPlayerModalOpen) handleClosePlayerModal();
        if (isMatchCenterOpen) setIsMatchCenterOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlayerModalOpen, isMatchCenterOpen]);

  // =========================================================================
  // 2. STREAM RESOLUTION & PLAYBACK MODAL HANDLER
  // =========================================================================
  const handleWatchLive = async (fixture: FixtureItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    setActivePlaybackFixture(fixture);
    setIsPlayerModalOpen(true);
    setResolvingId(fixture.id);
    setResolveError(null);
    setEmbedUrl(null);

    const targetUrl = fixture.stream_url;

    if (!targetUrl) {
      setResolveError("No direct stream URL was provided by the feed for this match.");
      setResolvingId(null);
      return;
    }

    try {
      const resolveEndpoint = `${BACKEND_API_BASE}/api/v1/resolve?target_url=${encodeURIComponent(
        targetUrl
      )}`;
      const res = await fetch(resolveEndpoint, {
        headers: { Accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Stream resolver returned HTTP ${res.status}`);
      }

      const data: ResolutionResponse = await res.json();

      if (data.status === "success" && data.embed_url) {
        setEmbedUrl(data.embed_url);
      } else {
        // Fallback directly to target stream URL
        setEmbedUrl(targetUrl);
        if (data.message) {
          console.info("Stream resolver status message:", data.message);
        }
      }
    } catch (err: any) {
      console.warn("Resolver endpoint notice, falling back to direct stream URL:", err);
      // Even if resolver fails, use the raw stream url as direct player target
      setEmbedUrl(targetUrl);
    } finally {
      setResolvingId(null);
    }
  };

  const handleClosePlayerModal = () => {
    setIsPlayerModalOpen(false);
    setActivePlaybackFixture(null);
    setEmbedUrl(null);
    setResolveError(null);
    setIsFullscreen(false);
    setResolvingId(null);
  };

  const handleOpenMatchCenter = (fixture: FixtureItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMatchCenterFixture(fixture);
    setUserPollVote(null);
    setIsMatchCenterOpen(true);
  };

  // =========================================================================
  // 3. DYNAMIC FILTERING & SEARCH
  // =========================================================================
  const filteredFixtures = useMemo(() => {
    return fixtures.filter((fix) => {
      // 1. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = fix.title.toLowerCase().includes(q);
        const matchHome = fix.homeTeam.name.toLowerCase().includes(q);
        const matchAway = fix.awayTeam.name.toLowerCase().includes(q);
        const matchLeague = fix.league.toLowerCase().includes(q);
        if (!matchTitle && !matchHome && !matchAway && !matchLeague) return false;
      }

      // 2. Sport Category Filter
      if (selectedSport !== "All" && fix.sport !== selectedSport) {
        return false;
      }

      // 3. Status Tab Filter
      if (selectedStatus === "LIVE" && !fix.isLive) return false;
      if (selectedStatus === "UPCOMING" && fix.status !== "UPCOMING") return false;
      if (selectedStatus === "FINISHED" && fix.status !== "FINISHED") return false;

      return true;
    });
  }, [fixtures, searchQuery, selectedSport, selectedStatus]);

  const liveCount = fixtures.filter((f) => f.isLive).length;
  const upcomingCount = fixtures.filter((f) => f.status === "UPCOMING").length;
  const finishedCount = fixtures.filter((f) => f.status === "FINISHED").length;

  return (
    <div id="live-sports-grid-container" className="w-full min-h-screen bg-[#F9FAFB] text-slate-900 font-sans antialiased p-3 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ========================================================================= */}
        {/* HEADER SECTION                                                           */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
                  Live & Upcoming Fixtures
                </h1>

                {/* Pinkish-red pill badge: "● X LIVE" */}
                {liveCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 border border-rose-200/80 font-black text-xs uppercase tracking-wider shadow-xs animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping inline-block" />
                    <span>● {liveCount} LIVE</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold text-xs">
                    <span>{fixtures.length} Total Matches</span>
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-medium text-slate-500">
                Real-time scores, lineups, fan predictions & direct live stream playback
              </p>
            </div>

            {/* Refresh Feed Button */}
            <div className="flex items-center gap-2">
              <button
                id="refresh-fixtures-feed-btn"
                type="button"
                onClick={fetchFixtures}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-bold text-slate-700 shadow-xs hover:border-slate-300 transition-all cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin text-indigo-600" : ""}`} />
                <span>{loading ? "Refreshing..." : "Refresh Feed"}</span>
              </button>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SEARCH BAR (Full width with search icon)                                  */}
          {/* ========================================================================= */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="fixtures-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team, derby, or league..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200/90 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ========================================================================= */}
          {/* CATEGORY & STATUS FILTER PILLS                                            */}
          {/* ========================================================================= */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            {/* Sport Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  { key: "All", label: "⚡ All Sports" },
                  { key: "Football", label: "⚽ Football (Soccer)" },
                  { key: "Basketball", label: "🏀 Basketball" },
                  { key: "Formula 1", label: "🏎️ Formula 1" },
                  { key: "Combat", label: "🥊 UFC & Boxing" },
                ] as const
              ).map((tab) => {
                const isActive = selectedSport === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setSelectedSport(tab.key)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {(
                [
                  { key: "ALL", label: `All (${fixtures.length})` },
                  { key: "LIVE", label: `Live (${liveCount})` },
                  { key: "UPCOMING", label: `Upcoming (${upcomingCount})` },
                  { key: "FINISHED", label: `Results / FT` },
                ] as const
              ).map((statusTab) => {
                const isActive = selectedStatus === statusTab.key;
                return (
                  <button
                    key={statusTab.key}
                    type="button"
                    onClick={() => setSelectedStatus(statusTab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-black"
                        : "bg-white text-slate-500 border border-slate-200/60 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    {statusTab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. LOADING STATE: 6-CARD SKELETON LOADING GRID                            */}
        {/* ========================================================================= */}
        {loading ? (
          <div id="fixtures-loading-skeleton-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6].map((skelIndex) => (
              <div
                key={skelIndex}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 animate-pulse"
              >
                {/* Top Badge & Time Skeleton */}
                <div className="flex items-center justify-between gap-2">
                  <div className="h-4 w-28 bg-slate-200 rounded-md" />
                  <div className="h-5 w-16 bg-slate-200 rounded-full" />
                </div>

                {/* Scoreboard / Teams Skeleton */}
                <div className="flex items-center justify-between py-2 gap-3">
                  {/* Home Team */}
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-slate-200" />
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                  </div>

                  {/* Center Match Info */}
                  <div className="flex flex-col items-center space-y-1 px-2">
                    <div className="h-4 w-8 bg-slate-200 rounded" />
                    <div className="h-2.5 w-12 bg-slate-100 rounded" />
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center space-y-2 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-slate-200" />
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                  </div>
                </div>

                {/* Bottom Actions Skeleton */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-8 w-24 bg-slate-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredFixtures.length === 0 ? (
          /* ========================================================================= */
          /* 5. EMPTY STATE: NO LIVE MATCHES ON FAWANEWS                               */
          /* ========================================================================= */
          <div
            id="fixtures-empty-state-card"
            className="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs space-y-5"
          >
            <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-2xs">
              <Tv className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                No live matches scheduled on FawaNews right now
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {fetchError 
                  ? `Live feed status: ${fetchError}` 
                  : "All daily sports feeds will appear here automatically as soon as kickoff timings or live streaming relays become active."}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                id="empty-state-refresh-btn"
                type="button"
                onClick={fetchFixtures}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh Feed</span>
              </button>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
                >
                  Clear Search Filter
                </button>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* 6. DYNAMIC MATCH CARDS (3-COLUMN RESPONSIVE GRID)                         */
          /* ========================================================================= */
          <div id="fixtures-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredFixtures.map((fixture) => {
              const isConnecting = resolvingId === fixture.id;

              return (
                <div
                  key={fixture.id}
                  id={`fixture-card-${fixture.id}`}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200/80 transition-all flex flex-col justify-between space-y-4 group"
                >
                  {/* Top Bar: League Header & Status Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 truncate">
                        {fixture.league}
                      </span>
                    </div>

                    {/* Status Pill Badge */}
                    {fixture.isLive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 font-black text-[11px] uppercase tracking-wider shrink-0 animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-600 inline-block" />
                        <span>LIVE</span>
                      </span>
                    ) : fixture.status === "FINISHED" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[11px] uppercase tracking-wider shrink-0">
                        <span>FT</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-[11px] shrink-0">
                        <Clock className="w-3 h-3" />
                        <span>{fixture.time}</span>
                      </span>
                    )}
                  </div>

                  {/* Teams & Scoreboard Section */}
                  <div className="flex items-center justify-between py-2 gap-2">
                    {/* Home Team */}
                    <div className="flex flex-col items-center text-center space-y-1.5 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                        <img
                          src={fixture.homeTeam.logo}
                          alt={fixture.homeTeam.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                            if ((e.target as HTMLElement).parentElement) {
                              (e.target as HTMLElement).parentElement!.innerText = fixture.homeTeam.short;
                            }
                          }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-900 truncate max-w-[110px]">
                        {fixture.homeTeam.name}
                      </span>
                    </div>

                    {/* Score or VS in the middle */}
                    <div className="flex flex-col items-center justify-center px-2 shrink-0">
                      {fixture.isLive || fixture.status === "FINISHED" ? (
                        <div className="text-lg font-black text-slate-900 tracking-tight">
                          {fixture.homeTeam.score !== undefined ? fixture.homeTeam.score : "•"}{" "}
                          -{" "}
                          {fixture.awayTeam.score !== undefined ? fixture.awayTeam.score : "•"}
                        </div>
                      ) : (
                        <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                          VS
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-400 mt-0.5">
                        {fixture.sport}
                      </span>
                    </div>

                    {/* Away Team */}
                    <div className="flex flex-col items-center text-center space-y-1.5 flex-1 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                        <img
                          src={fixture.awayTeam.logo}
                          alt={fixture.awayTeam.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                            if ((e.target as HTMLElement).parentElement) {
                              (e.target as HTMLElement).parentElement!.innerText = fixture.awayTeam.short;
                            }
                          }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-900 truncate max-w-[110px]">
                        {fixture.awayTeam.name}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Actions: "Match Center & Stats" (Left) | "▶ Watch Live" (Right) */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Match Center & Stats link */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenMatchCenter(fixture, e)}
                      className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Activity className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Match Center & Stats</span>
                    </button>

                    {/* Primary Button: "▶ Watch Live" */}
                    <button
                      type="button"
                      id={`watch-btn-${fixture.id}`}
                      disabled={isConnecting}
                      onClick={(e) => handleWatchLive(fixture, e)}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer shrink-0 disabled:opacity-75"
                    >
                      {isConnecting ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 fill-current" />
                          <span>Watch Live</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STREAM RESOLUTION & PLAYBACK MODAL                                        */}
        {/* ========================================================================= */}
        {isPlayerModalOpen && activePlaybackFixture && (
          <div
            id="stream-playback-modal-overlay"
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn"
          >
            <div
              className={`bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden transition-all duration-300 ${
                isFullscreen
                  ? "w-full h-full rounded-none border-0"
                  : "w-full max-w-5xl max-h-[92vh] h-auto"
              }`}
            >
              {/* Modal Header Bar */}
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 bg-rose-600 text-white rounded-lg shrink-0">
                    <Radio className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h2 className="text-sm sm:text-base font-black text-white truncate">
                      {activePlaybackFixture.title}
                    </h2>
                    <p className="text-[11px] text-slate-300 truncate">
                      {activePlaybackFixture.league} • {activePlaybackFixture.details || "Direct Live Stream Feed"}
                    </p>
                  </div>
                </div>

                {/* Header Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  >
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>

                  <button
                    id="close-stream-modal-btn"
                    onClick={handleClosePlayerModal}
                    className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer ml-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Close</span>
                  </button>
                </div>
              </div>

              {/* Video Player <iframe> Container */}
              <div className="relative flex-1 bg-black aspect-video min-h-[300px] sm:min-h-[460px] flex items-center justify-center overflow-hidden">
                {resolvingId !== null ? (
                  <div className="text-center space-y-3 p-6">
                    <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
                    <p className="text-sm font-extrabold text-white">Connecting to live stream resolver...</p>
                    <p className="text-xs text-slate-400">Extracting high bitrate embed player stream from FawaNews</p>
                  </div>
                ) : embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={activePlaybackFixture.title}
                    className="w-full h-full border-0 absolute inset-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    sandbox="allow-scripts allow-same-origin allow-presentation allow-forms allow-popups"
                  />
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                    <p className="text-sm font-bold text-white">Live Stream Resolution Notice</p>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      {resolveError || "This live stream source requires direct playback authentication or target stream relay."}
                    </p>
                    {activePlaybackFixture.stream_url && (
                      <a
                        href={activePlaybackFixture.stream_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <span>Open Direct Stream Source</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
                <span className="truncate max-w-md">
                  Source: <code className="text-slate-900 font-mono text-[11px] bg-slate-200/80 px-1.5 py-0.5 rounded">{activePlaybackFixture.stream_url || "Direct Embed"}</code>
                </span>
                <span className="shrink-0 text-[11px] text-slate-500">
                  Press <kbd className="px-1.5 py-0.5 bg-white text-slate-700 rounded text-[10px] font-mono border border-slate-300 shadow-2xs">ESC</kbd> to exit
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MATCH CENTER & STATS MODAL                                                */}
        {/* ========================================================================= */}
        {isMatchCenterOpen && activeMatchCenterFixture && (
          <div
            id="match-center-modal-overlay"
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
              {/* Top Banner */}
              <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider block">
                    {activeMatchCenterFixture.league}
                  </span>
                  <h3 className="text-base font-black text-white">
                    {activeMatchCenterFixture.homeTeam.name} vs {activeMatchCenterFixture.awayTeam.name}
                  </h3>
                </div>
                <button
                  onClick={() => setIsMatchCenterOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scoreboard Hero */}
              <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center justify-around">
                {/* Home */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-2 shadow-xs flex items-center justify-center">
                    <img
                      src={activeMatchCenterFixture.homeTeam.logo}
                      alt={activeMatchCenterFixture.homeTeam.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-black text-slate-900">{activeMatchCenterFixture.homeTeam.name}</span>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center justify-center">
                  <div className="text-3xl font-black text-slate-900 tracking-tight">
                    {activeMatchCenterFixture.homeTeam.score ?? 0} - {activeMatchCenterFixture.awayTeam.score ?? 0}
                  </div>
                  <span className={`text-xs font-extrabold mt-1 ${activeMatchCenterFixture.isLive ? "text-rose-600 animate-pulse" : "text-slate-500"}`}>
                    {activeMatchCenterFixture.time}
                  </span>
                  {activeMatchCenterFixture.venue && (
                    <span className="text-[10px] text-slate-400 mt-1 max-w-[180px] text-center truncate">
                      {activeMatchCenterFixture.venue}
                    </span>
                  )}
                </div>

                {/* Away */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 p-2 shadow-xs flex items-center justify-center">
                    <img
                      src={activeMatchCenterFixture.awayTeam.logo}
                      alt={activeMatchCenterFixture.awayTeam.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-black text-slate-900">{activeMatchCenterFixture.awayTeam.name}</span>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="flex items-center border-b border-slate-200 px-4">
                <button
                  onClick={() => setMatchCenterTab("stats")}
                  className={`py-2.5 px-4 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
                    matchCenterTab === "stats"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Live Stats
                </button>
                <button
                  onClick={() => setMatchCenterTab("poll")}
                  className={`py-2.5 px-4 text-xs font-extrabold border-b-2 transition-colors cursor-pointer ${
                    matchCenterTab === "poll"
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Fan Prediction Poll
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-5 overflow-y-auto space-y-4">
                {matchCenterTab === "stats" && (
                  <div className="space-y-3">
                    {(activeMatchCenterFixture.stats || [
                      { label: "Ball Possession", home: "50%", away: "50%" },
                      { label: "Total Shots", home: 0, away: 0 },
                      { label: "Shots on Target", home: 0, away: 0 }
                    ]).map((stat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>{stat.home}</span>
                          <span className="text-slate-500 font-semibold">{stat.label}</span>
                          <span>{stat.away}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                          <div className="bg-indigo-600 h-full w-1/2" />
                          <div className="bg-slate-300 h-full w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {matchCenterTab === "poll" && (
                  <div className="space-y-3 text-center">
                    <p className="text-xs font-bold text-slate-600">
                      Who will win this match? Cast your prediction:
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      <button
                        onClick={() => setUserPollVote("home")}
                        className={`p-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                          userPollVote === "home"
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                        }`}
                      >
                        {activeMatchCenterFixture.homeTeam.name} Win
                      </button>
                      <button
                        onClick={() => setUserPollVote("draw")}
                        className={`p-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                          userPollVote === "draw"
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                        }`}
                      >
                        Draw
                      </button>
                      <button
                        onClick={() => setUserPollVote("away")}
                        className={`p-3 rounded-xl border text-xs font-extrabold transition-all cursor-pointer ${
                          userPollVote === "away"
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800"
                        }`}
                      >
                        {activeMatchCenterFixture.awayTeam.name} Win
                      </button>
                    </div>

                    {userPollVote && (
                      <p className="text-xs font-extrabold text-emerald-600 flex items-center justify-center gap-1 pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Prediction submitted!</span>
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setIsMatchCenterOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={(e) => {
                    setIsMatchCenterOpen(false);
                    handleWatchLive(activeMatchCenterFixture, e);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Live Stream</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default LiveSportsGrid;
