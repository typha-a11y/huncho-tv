import { useState } from "react";
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
  ChevronRight,
  Info
} from "lucide-react";
import { LiveChannel } from "../types";
import { useStore } from "../lib/store";

interface LiveSportsViewProps {
  onExplore?: () => void;
  // Future state prop for scraper injection
  liveChannels?: LiveChannel[];
  isScraperActive?: boolean;
}

export function LiveSportsView({ 
  onExplore, 
  liveChannels = [], 
  isScraperActive = false 
}: LiveSportsViewProps) {
  const [subscribedAlert, setSubscribedAlert] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [channels] = useState<LiveChannel[]>(liveChannels);
  
  // Store or modal trigger for video playback
  const setStreamPlayerSource = useStore((s) => (s as any).setStreamPlayerSource);

  const handleAlertClick = () => {
    setSubscribedAlert(true);
    setTimeout(() => {
      setSubscribedAlert(false);
    }, 6000);
  };

  // Teaser cards for Pre-Scraper state
  const teaserCards = [
    {
      id: "premier-league",
      title: "Premier League ⚽",
      category: "Sports",
      badge: "LIVE 1080p 60fps",
      gradient: "from-emerald-500 to-teal-700",
      bgImage: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80",
      description: "All 380 matchday broadcasts, English commentary, high bitrate multi-audio streams.",
      upcomingEvent: "Arsenal vs Man City • Sat 18:00 EAT",
      tags: ["HD 1080p", "SuperSport 3", "Sky Sports"]
    },
    {
      id: "champions-league",
      title: "Champions League 🏆",
      category: "Sports",
      badge: "UEFA NIGHTS",
      gradient: "from-blue-600 to-indigo-800",
      bgImage: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=800&q=80",
      description: "Europe's premier football tournament in 4K Ultra HD with live match stats.",
      upcomingEvent: "Real Madrid vs Bayern • Tue 22:00 EAT",
      tags: ["4K Ultra HD", "TNT Sports", "CBS Sports"]
    },
    {
      id: "supersport-live",
      title: "SuperSport Live 📺",
      category: "SuperSport",
      badge: "24/7 CHANNELS",
      gradient: "from-indigo-600 to-purple-800",
      bgImage: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80",
      description: "SuperSport Grandstand, Premier League, Variety 1-4 & Action 24-hour HD feeds.",
      upcomingEvent: "SuperSport 1, 2, 3, 4 Feeds",
      tags: ["Multi-Feed", "Subtitles", "DSTV HD"]
    },
    {
      id: "movie-channels",
      title: "Movie Channels 🍿",
      category: "Movies & TV",
      badge: "CINEMA 24/7",
      gradient: "from-amber-500 to-rose-700",
      bgImage: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
      description: "Continuous Hollywood blockbusters, action non-stop, HBO & Cinema channels.",
      upcomingEvent: "24/7 Non-Stop Movies",
      tags: ["HBO Live", "Starz", "M-Net HD"]
    },
    {
      id: "world-cup-afcon",
      title: "AFCON & World Cup 🌍",
      category: "International",
      badge: "TOURNAMENTS",
      gradient: "from-green-600 to-emerald-800",
      bgImage: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?auto=format&fit=crop&w=800&q=80",
      description: "African Cup of Nations, World Cup qualifiers and international friendlies.",
      upcomingEvent: "Harambee Stars & Taifa Stars Live",
      tags: ["CAF", "FIFA", "Swahili Commentary"]
    },
    {
      id: "news-entertainment",
      title: "News & Entertainment 🗞️",
      category: "TV Broadcast",
      badge: "WORLD NEWS",
      gradient: "from-slate-700 to-slate-900",
      bgImage: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
      description: "BBC News, Sky News, CNN, Al Jazeera, Discovery Channel & National Geographic.",
      upcomingEvent: "Breaking News & Documentaries",
      tags: ["BBC HD", "Sky News", "CNN"]
    }
  ];

  const filteredCards = selectedCategory === "all" 
    ? teaserCards 
    : teaserCards.filter(c => c.category === selectedCategory || (selectedCategory === "Sports" && c.category === "SuperSport"));

  // Check if scraper active or channels present
  const showScraperLiveGrid = isScraperActive || channels.length > 0;

  return (
    <div className="w-full space-y-6 text-slate-900">
      {/* Toast Alert Banner when clicking Early Access */}
      <AnimatePresence>
        {subscribedAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 left-4 md:left-auto md:right-8 md:max-w-md z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-start gap-3 backdrop-blur-xl"
          >
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                VIP Alert Activated! 🔔
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                You're officially on the priority waitlist! You'll receive instant notification as soon as the Dulo Live API scraper goes online.
              </p>
            </div>
            <button 
              onClick={() => setSubscribedAlert(false)}
              className="text-slate-400 hover:text-white p-1 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 md:p-10 border border-slate-800 shadow-xl">
        {/* Glow ambient background lights */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black backdrop-blur-md">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>24/7 BROADCAST PLATFORM</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black ml-1">
              ⚡ SOON
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
            24/7 HD Channels & Live Sports
          </h1>

          <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
            Stream live Premier League matches, UEFA Champions League, SuperSport, and 24/7 HD TV channels straight from high-speed low-latency HLS servers.
          </p>

          <div className="flex items-center gap-2 pt-1 text-xs text-emerald-400 font-semibold">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Scraper integration (Dulo Live API) launching soon!</span>
          </div>

          {/* Action buttons */}
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={handleAlertClick}
              className="px-5 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Bell className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
              <span>Get Early Access Alert 🔔</span>
            </button>

            {onExplore && (
              <button
                onClick={onExplore}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm rounded-xl border border-white/20 transition-all cursor-pointer"
              >
                Explore Movies & Series
              </button>
            )}
          </div>
        </div>
      </div>

      {/* FILTER & TEASER CATEGORY SELECTOR */}
      <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full hide-scrollbar">
          {[
            { id: "all", label: "All Channels" },
            { id: "Sports", label: "⚽ Live Sports" },
            { id: "SuperSport", label: "📺 SuperSport" },
            { id: "Movies & TV", label: "🍿 Movies & Cinema" },
            { id: "TV Broadcast", label: "🗞️ News & TV" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>HLS 1080p Stream Standard</span>
        </div>
      </div>

      {/* RENDER PRE-SCRAPER TEASER GRID vs FUTURE SCRAPER GRID */}
      {showScraperLiveGrid ? (
        /* FUTURE STATE (Scraper Active): Renders direct live channels */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {channels.map((chan) => (
            <div
              key={chan.channel_id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="aspect-video rounded-xl bg-slate-900 relative overflow-hidden mb-3">
                <img
                  src={chan.thumbnail}
                  alt={chan.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-rose-600 text-white text-[10px] font-black rounded-md uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  LIVE
                </span>
                {chan.hd_quality && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-md">
                    {chan.hd_quality}
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-indigo-600 uppercase">{chan.category}</div>
                <h3 className="font-bold text-slate-900 text-base">{chan.title}</h3>
                {chan.current_show && (
                  <p className="text-xs text-slate-500 line-clamp-1">{chan.current_show}</p>
                )}
              </div>
              <button
                onClick={() => {
                  if (setStreamPlayerSource) {
                    setStreamPlayerSource(chan.stream_url, chan.title);
                  }
                }}
                className="mt-3 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Watch Live Now</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        /* CURRENT STATE (Pre-Scraper Teaser Grid) */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {filteredCards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl overflow-hidden flex flex-col justify-between transition-all duration-300"
            >
              {/* Card Thumbnail / Banner */}
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                <img 
                  src={card.bgImage} 
                  alt={card.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 opacity-80 group-hover:opacity-95" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className={`px-2.5 py-1 bg-gradient-to-r ${card.gradient} text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-md flex items-center gap-1`}>
                    <Activity className="w-3 h-3 animate-pulse" />
                    {card.badge}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                    {card.category}
                  </span>
                  <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug drop-shadow-sm">
                    {card.title}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {card.description}
                </p>

                {/* Upcoming Event Box */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                    <Tv className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] font-bold text-slate-800 truncate">
                    {card.upcomingEvent}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {card.tags.map((t, idx) => (
                    <span 
                      key={idx} 
                      className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md border border-slate-200/50"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Scraper Status Footer */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-semibold flex items-center gap-1">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span>Dulo Scraper Feed</span>
                  </span>
                  <button
                    onClick={handleAlertClick}
                    className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Notify Me</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Info Card explaining Dulo Live API Scraper */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shrink-0 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Automated Live Scraper Integration (Dulo Live API)
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
              Our automated backend service parses and extracts direct HLS stream manifests (`.m3u8`) from licensed sports distributors and live satellite channels. Once activated, live events will render dynamically inside Huncho TV's built-in light player.
            </p>
          </div>
        </div>

        <button
          onClick={handleAlertClick}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
        >
          Subscribe for Launch
        </button>
      </div>
    </div>
  );
}
