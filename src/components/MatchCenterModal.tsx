import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Play,
  Tv,
  Activity,
  BarChart2,
  Users,
  Vote,
  Bell,
  CheckCircle2,
  Radio,
  Clock,
  MapPin,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Zap,
  Volume2
} from "lucide-react";
import { Fixture, StreamSource } from "../types/sports";
import { useStore } from "../lib/store";
import { useModalAccessibility } from "../hooks/useModalAccessibility";

interface MatchCenterModalProps {
  fixture: Fixture | null;
  isOpen: boolean;
  onClose: () => void;
  isReminded?: boolean;
  onToggleReminder?: (fixtureId: string) => void;
}

type TabType = "stream" | "timeline" | "stats" | "lineups" | "prediction";

export function MatchCenterModal({
  fixture,
  isOpen,
  onClose,
  isReminded = false,
  onToggleReminder
}: MatchCenterModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("stream");
  const [selectedSource, setSelectedSource] = useState<StreamSource | null>(null);
  const [userVote, setUserVote] = useState<"home" | "draw" | "away" | null>(null);
  const [votes, setVotes] = useState({ home: 100, draw: 50, away: 100 });

  const setVideoPlayerOpen = useStore((s) => s.setVideoPlayerOpen);

  const { modalRef, modalProps, getTransitionDuration } = useModalAccessibility({
    isOpen,
    onClose
  });

  useEffect(() => {
    if (fixture) {
      setSelectedSource(fixture.sources[0] || null);
      if (fixture.votes) {
        setVotes(fixture.votes);
      }
      // Check saved user vote
      const savedVote = localStorage.getItem(`match_vote_${fixture.id}`);
      if (savedVote === "home" || savedVote === "draw" || savedVote === "away") {
        setUserVote(savedVote);
      } else {
        setUserVote(null);
      }
    }
  }, [fixture]);

  if (!isOpen || !fixture) return null;

  const totalVotes = votes.home + votes.draw + votes.away;
  const homePct = totalVotes > 0 ? Math.round((votes.home / totalVotes) * 100) : 33;
  const drawPct = totalVotes > 0 ? Math.round((votes.draw / totalVotes) * 100) : 34;
  const awayPct = totalVotes > 0 ? Math.round((votes.away / totalVotes) * 100) : 33;

  const handleCastVote = (choice: "home" | "draw" | "away") => {
    if (userVote) return;
    setUserVote(choice);
    localStorage.setItem(`match_vote_${fixture.id}`, choice);
    setVotes((prev) => ({
      ...prev,
      [choice]: prev[choice] + 1
    }));
  };

  const handleLaunchLiveStream = (source?: StreamSource) => {
    const src = source || selectedSource || fixture.sources[0];
    const streamUrl = src?.streamUrl || fixture.streamUrl;
    const channelSlug = fixture.channel_slug || fixture.slug || fixture.id;

    setVideoPlayerOpen(true, streamUrl, `${fixture.title} (${src?.name || "Live"})`, {
      isLiveStream: true,
      title: fixture.title,
      category: fixture.league,
      streamType: "direct_hls",
      channelSlug
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          ref={modalRef}
          {...modalProps}
          aria-labelledby="match-center-title"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: getTransitionDuration(0.2), ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-slate-900 my-auto focus:outline-none max-h-[90vh]"
        >
          {/* Top Bar Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white z-20">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1.5 rounded-lg bg-rose-600 text-white">
                <Radio className="w-4 h-4 animate-pulse" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider">
                    {fixture.league}
                  </span>
                  {fixture.isLive && (
                    <span className="px-2 py-0.2 bg-rose-600 text-white text-[9px] font-black uppercase rounded-full animate-pulse">
                      LIVE
                    </span>
                  )}
                </div>
                <h2 id="match-center-title" className="text-xs sm:text-sm font-bold text-slate-200 truncate">
                  {fixture.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onToggleReminder && !fixture.isLive && (
                <button
                  onClick={() => onToggleReminder(fixture.id)}
                  className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isReminded
                      ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                  title={isReminded ? "Reminder active" : "Set match reminder"}
                >
                  <Bell className={`w-4 h-4 ${isReminded ? "fill-current" : ""}`} />
                  <span className="hidden sm:inline">{isReminded ? "Reminded" : "Notify"}</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Match Scoreboard Hero Card */}
          <div className="p-5 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white border-b border-slate-700/50">
            <div className="flex items-center justify-between gap-2 sm:gap-6">
              {/* Home Team */}
              <div className="flex-1 flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 p-2.5 flex items-center justify-center border border-white/20 backdrop-blur-md shadow-lg">
                  <img
                    src={fixture.homeTeam.logo}
                    alt={fixture.homeTeam.name}
                    className="w-full h-full object-contain filter drop-shadow-md"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                      if ((e.target as HTMLElement).parentElement) {
                        (e.target as HTMLElement).parentElement!.innerText = fixture.homeTeam.short;
                      }
                    }}
                  />
                </div>
                <span className="font-extrabold text-xs sm:text-sm text-white max-w-[120px] truncate">
                  {fixture.homeTeam.name}
                </span>
              </div>

              {/* Score / Center Info */}
              <div className="flex flex-col items-center justify-center space-y-1.5 shrink-0 px-2 sm:px-4">
                {fixture.status === "LIVE" || fixture.status === "FINISHED" ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {fixture.homeTeam.score ?? 0}
                    </span>
                    <span className="text-xl font-bold text-slate-400">-</span>
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {fixture.awayTeam.score ?? 0}
                    </span>
                  </div>
                ) : (
                  <div className="px-4 py-1.5 rounded-full bg-white/10 text-white font-black text-xs sm:text-sm border border-white/20 tracking-wider">
                    VS
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs font-extrabold">
                  {fixture.isLive ? (
                    <span className="text-rose-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                      {fixture.time}
                    </span>
                  ) : (
                    <span className="text-slate-300 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {fixture.time}
                    </span>
                  )}
                </div>

                {fixture.venue && (
                  <span className="text-[10px] text-slate-400 flex items-center gap-1 text-center truncate max-w-[180px]">
                    <MapPin className="w-2.5 h-2.5 shrink-0" />
                    {fixture.venue}
                  </span>
                )}
              </div>

              {/* Away Team */}
              <div className="flex-1 flex flex-col items-center text-center space-y-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 p-2.5 flex items-center justify-center border border-white/20 backdrop-blur-md shadow-lg">
                  <img
                    src={fixture.awayTeam.logo}
                    alt={fixture.awayTeam.name}
                    className="w-full h-full object-contain filter drop-shadow-md"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                      if ((e.target as HTMLElement).parentElement) {
                        (e.target as HTMLElement).parentElement!.innerText = fixture.awayTeam.short;
                      }
                    }}
                  />
                </div>
                <span className="font-extrabold text-xs sm:text-sm text-white max-w-[120px] truncate">
                  {fixture.awayTeam.name}
                </span>
              </div>
            </div>

            {/* Quick Action Button */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-center">
              <button
                onClick={() => handleLaunchLiveStream()}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{fixture.isLive ? "Watch Live HD Stream Now" : "Launch Match Stream Channel"}</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-4 pt-3 pb-2 border-b border-slate-200 bg-slate-50 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setActiveTab("stream")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "stream"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>Streams ({fixture.sources.length})</span>
            </button>

            {fixture.events && fixture.events.length > 0 && (
              <button
                onClick={() => setActiveTab("timeline")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === "timeline"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Timeline</span>
              </button>
            )}

            {fixture.stats && fixture.stats.length > 0 && (
              <button
                onClick={() => setActiveTab("stats")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === "stats"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Stats</span>
              </button>
            )}

            {fixture.lineups && (
              <button
                onClick={() => setActiveTab("lineups")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === "lineups"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Lineups</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("prediction")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === "prediction"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <Vote className="w-3.5 h-3.5" />
              <span>Poll ({totalVotes})</span>
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 max-h-[45vh] space-y-4">
            {/* Tab 1: Live Streams & Mirrors */}
            {activeTab === "stream" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Select stream feed & commentary:</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Direct HLS Proxy
                  </span>
                </div>

                <div className="space-y-2.5">
                  {fixture.sources.map((src) => {
                    const isSelected = selectedSource?.id === src.id;
                    return (
                      <div
                        key={src.id}
                        onClick={() => setSelectedSource(src)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-indigo-50/70 border-indigo-300 shadow-xs ring-2 ring-indigo-500/20"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
                          }`}>
                            <Radio className="w-4 h-4" />
                          </div>

                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm truncate">
                              {src.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                              <span className="font-bold text-slate-700">{src.language}</span>
                              <span>•</span>
                              <span className="font-bold text-emerald-600">{src.quality}</span>
                              <span>•</span>
                              <span>{src.latency}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLaunchLiveStream(src);
                          }}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm shrink-0 cursor-pointer transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Playback Tip</span>
                  </div>
                  <p className="leading-relaxed">
                    Streams automatically play in Huncho Player with low latency HLS buffering, picture-in-picture, and ad-free popup blocker.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Timeline & Live Events */}
            {activeTab === "timeline" && fixture.events && (
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Match Highlights & Key Events
                </h4>

                <div className="relative border-l-2 border-slate-200 ml-4 space-y-4 py-2">
                  {fixture.events.map((evt, idx) => {
                    const isHome = evt.team === "home";
                    const teamName = isHome ? fixture.homeTeam.name : fixture.awayTeam.name;

                    return (
                      <div key={idx} className="relative pl-6">
                        {/* Dot on the timeline */}
                        <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                          evt.type === "goal"
                            ? "bg-emerald-500 shadow-sm"
                            : evt.type === "card"
                            ? "bg-amber-500 shadow-sm"
                            : "bg-blue-500 shadow-sm"
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>

                        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-start justify-between gap-3">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-xs text-slate-900">
                                {evt.player}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                                {teamName}
                              </span>
                            </div>
                            {evt.description && (
                              <p className="text-xs text-slate-500 leading-normal">
                                {evt.description}
                              </p>
                            )}
                          </div>

                          <span className="text-xs font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md shrink-0">
                            {evt.minute}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Match Stats */}
            {activeTab === "stats" && fixture.stats && (
              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 px-2">
                  <span>{fixture.homeTeam.short}</span>
                  <span className="text-slate-400 uppercase text-[10px]">Head-to-Head Stats</span>
                  <span>{fixture.awayTeam.short}</span>
                </div>

                <div className="space-y-3">
                  {fixture.stats.map((stat, idx) => {
                    const homeVal = parseFloat(String(stat.home).replace("%", "")) || 0;
                    const awayVal = parseFloat(String(stat.away).replace("%", "")) || 0;
                    const total = homeVal + awayVal || 100;
                    const homeBar = Math.round((homeVal / total) * 100);

                    return (
                      <div key={idx} className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                          <span className="text-indigo-600 font-extrabold">{stat.home}</span>
                          <span className="text-[11px] font-semibold text-slate-500">{stat.label}</span>
                          <span className="text-rose-600 font-extrabold">{stat.away}</span>
                        </div>

                        {/* Visual Proportion Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden flex">
                          <div className="h-full bg-indigo-600" style={{ width: `${homeBar}%` }} />
                          <div className="h-full bg-rose-600" style={{ width: `${100 - homeBar}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 4: Lineups */}
            {activeTab === "lineups" && fixture.lineups && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Home Lineup */}
                  <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-xs font-extrabold text-slate-900">{fixture.homeTeam.name}</span>
                      <span className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                        {fixture.lineups.formationHome || "Starting XI"}
                      </span>
                    </div>

                    <ul className="space-y-1">
                      {fixture.lineups.homeStarters?.map((player, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-center gap-2 py-0.5">
                          <span className="w-4 text-[10px] font-black text-slate-400">{idx + 1}</span>
                          <span className="font-semibold">{player}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Away Lineup */}
                  <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                      <span className="text-xs font-extrabold text-slate-900">{fixture.awayTeam.name}</span>
                      <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                        {fixture.lineups.formationAway || "Starting XI"}
                      </span>
                    </div>

                    <ul className="space-y-1">
                      {fixture.lineups.awayStarters?.map((player, idx) => (
                        <li key={idx} className="text-xs text-slate-700 flex items-center gap-2 py-0.5">
                          <span className="w-4 text-[10px] font-black text-slate-400">{idx + 1}</span>
                          <span className="font-semibold">{player}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Interactive Fan Prediction Poll */}
            {activeTab === "prediction" && (
              <div className="space-y-4">
                <div className="text-center space-y-1">
                  <h4 className="font-black text-slate-900 text-sm sm:text-base">
                    Who will win this match?
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Cast your vote and see community fan predictions live
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => handleCastVote("home")}
                    disabled={Boolean(userVote)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                      userVote === "home"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md scale-102"
                        : "bg-white border-slate-200 hover:border-indigo-400 text-slate-800"
                    }`}
                  >
                    <span className="text-xs font-black truncate max-w-[80px]">
                      {fixture.homeTeam.short} Win
                    </span>
                    <span className="text-base font-black">
                      {homePct}%
                    </span>
                    <span className="text-[10px] font-medium opacity-80">
                      {votes.home} votes
                    </span>
                  </button>

                  <button
                    onClick={() => handleCastVote("draw")}
                    disabled={Boolean(userVote)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                      userVote === "draw"
                        ? "bg-slate-900 text-white border-slate-900 shadow-md scale-102"
                        : "bg-white border-slate-200 hover:border-slate-400 text-slate-800"
                    }`}
                  >
                    <span className="text-xs font-black">Draw</span>
                    <span className="text-base font-black">
                      {drawPct}%
                    </span>
                    <span className="text-[10px] font-medium opacity-80">
                      {votes.draw} votes
                    </span>
                  </button>

                  <button
                    onClick={() => handleCastVote("away")}
                    disabled={Boolean(userVote)}
                    className={`p-3 rounded-2xl border flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                      userVote === "away"
                        ? "bg-rose-600 text-white border-rose-600 shadow-md scale-102"
                        : "bg-white border-slate-200 hover:border-rose-400 text-slate-800"
                    }`}
                  >
                    <span className="text-xs font-black truncate max-w-[80px]">
                      {fixture.awayTeam.short} Win
                    </span>
                    <span className="text-base font-black">
                      {awayPct}%
                    </span>
                    <span className="text-[10px] font-medium opacity-80">
                      {votes.away} votes
                    </span>
                  </button>
                </div>

                {userVote && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your vote is locked in! Total community votes: {totalVotes}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
