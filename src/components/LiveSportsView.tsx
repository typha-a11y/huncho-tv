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
  ExternalLink,
  ChevronRight,
  Zap,
  Info
} from "lucide-react";
import { AnimatedFlame } from "./AnimatedFlame";
import { useStore } from "../lib/store";

interface LiveSportsViewProps {
  onExplore?: () => void;
}

export function LiveSportsView({ onExplore }: LiveSportsViewProps) {
  const [subscribedAlert, setSubscribedAlert] = useState(false);
  const [selectedChannelCategory, setSelectedChannelCategory] = useState("All");

  const setVideoPlayerOpen = useStore((s) => s.setVideoPlayerOpen);

  const handleAlertClick = () => {
    setSubscribedAlert(true);
    setTimeout(() => {
      setSubscribedAlert(false);
    }, 5000);
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

  const handleLaunchFixture = (fix: any) => {
    const channelSlug = fix.channel_slug || fix.slug || fix.id;
    setVideoPlayerOpen(true, fix.streamUrl, fix.title, {
      isLiveStream: true,
      title: fix.title,
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

  // 1. Live & Upcoming Fixtures
  const fixtures = [
    {
      id: "fix-1",
      slug: "live-twins-orioles",
      channel_slug: "live-twins-orioles",
      title: "Minnesota Twins vs Baltimore Orioles",
      league: "MLB Baseball",
      status: "LIVE",
      time: "7th Inning",
      isLive: true,
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-twins-orioles",
      homeTeam: {
        name: "Minnesota Twins",
        short: "MIN",
        color: "bg-blue-900 text-red-500",
        logo: "https://a.espncdn.com/i/teamlogos/mlb/500/min.png"
      },
      awayTeam: {
        name: "Baltimore Orioles",
        short: "BAL",
        color: "bg-orange-600 text-black",
        logo: "https://a.espncdn.com/i/teamlogos/mlb/500/bal.png"
      }
    },
    {
      id: "fix-2",
      slug: "live-arsenal-chelsea",
      channel_slug: "live-arsenal-chelsea",
      title: "Arsenal vs Chelsea",
      league: "Premier League",
      status: "LIVE",
      time: "64' Second Half",
      isLive: true,
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-arsenal-chelsea",
      homeTeam: {
        name: "Arsenal",
        short: "ARS",
        color: "bg-red-600 text-white",
        logo: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png"
      },
      awayTeam: {
        name: "Chelsea",
        short: "CHE",
        color: "bg-blue-700 text-white",
        logo: "https://a.espncdn.com/i/teamlogos/soccer/500/363.png"
      }
    },
    {
      id: "fix-3",
      slug: "live-real-barca",
      channel_slug: "live-real-barca",
      title: "Real Madrid vs FC Barcelona",
      league: "La Liga • El Clásico",
      status: "LIVE",
      time: "38' First Half",
      isLive: true,
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-real-barca",
      homeTeam: {
        name: "Real Madrid",
        short: "RMA",
        color: "bg-slate-800 text-amber-400",
        logo: "https://a.espncdn.com/i/teamlogos/soccer/500/86.png"
      },
      awayTeam: {
        name: "FC Barcelona",
        short: "BAR",
        color: "bg-red-800 text-blue-400",
        logo: "https://a.espncdn.com/i/teamlogos/soccer/500/83.png"
      }
    },
    {
      id: "fix-4",
      slug: "live-gsw-lakers",
      channel_slug: "live-gsw-lakers",
      title: "Golden State Warriors vs LA Lakers",
      league: "NBA Basketball",
      status: "LIVE",
      time: "3rd Qtr • 04:12",
      isLive: true,
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-gsw-lakers",
      homeTeam: {
        name: "GS Warriors",
        short: "GSW",
        color: "bg-blue-600 text-amber-400",
        logo: "https://a.espncdn.com/i/teamlogos/nba/500/gsw.png"
      },
      awayTeam: {
        name: "LA Lakers",
        short: "LAL",
        color: "bg-purple-700 text-amber-300",
        logo: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png"
      }
    },
    {
      id: "fix-5",
      slug: "live-mci-liv",
      channel_slug: "live-mci-liv",
      title: "Manchester City vs Liverpool",
      league: "Premier League",
      status: "UPCOMING",
      time: "Today • 22:00 EAT",
      isLive: false,
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-mci-liv",
      homeTeam: {
        name: "Man City",
        short: "MCI",
        color: "bg-sky-500 text-white",
        logo: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png"
      },
      awayTeam: {
        name: "Liverpool",
        short: "LIV",
        color: "bg-red-700 text-white",
        logo: "https://a.espncdn.com/i/teamlogos/soccer/500/364.png"
      }
    },
    {
      id: "fix-6",
      slug: "live-soweto-derby",
      channel_slug: "live-soweto-derby",
      title: "Kaizer Chiefs vs Orlando Pirates",
      league: "Soweto Derby",
      status: "LIVE",
      time: "18' First Half",
      isLive: true,
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-soweto-derby",
      homeTeam: {
        name: "Kaizer Chiefs",
        short: "KCH",
        color: "bg-amber-500 text-black",
        logo: "https://a.espncdn.com/i/teamlogos/soccer/500/8053.png"
      },
      awayTeam: {
        name: "Orlando Pirates",
        short: "PIR",
        color: "bg-black text-white",
        logo: "https://a.espncdn.com/i/teamlogos/soccer/500/8054.png"
      }
    }
  ];

  // 2. Middle Section: More Live Sources
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

  // 3. Bottom Grid Section: 24/7 Live Channels
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
      gradient: "from-red-600 to-slate-900",
      logoText: "CNN",
      logoBg: "bg-red-600",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b1/CNN.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-cnn"
    },
    {
      id: "chan-aljazeera",
      slug: "al-jazeera-english",
      channel_slug: "al-jazeera-english",
      name: "Al Jazeera English",
      category: "News",
      quality: "1080p HD",
      gradient: "from-amber-600 to-slate-900",
      logoText: "AL JAZEERA",
      logoBg: "bg-amber-600",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Al_Jazeera_English_logo.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-aljazeera"
    },
    {
      id: "chan-hbo",
      slug: "hbo-live",
      channel_slug: "hbo-live",
      name: "HBO Live Cinema",
      category: "Movies",
      quality: "1080p Ultra",
      gradient: "from-slate-900 to-purple-950",
      logoText: "HBO",
      logoBg: "bg-slate-900",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-hbo"
    },
    {
      id: "chan-cinemax",
      slug: "cinemax-action",
      channel_slug: "cinemax-action",
      name: "Cinemax Action",
      category: "Movies",
      quality: "1080p HD",
      gradient: "from-yellow-600 to-zinc-900",
      logoText: "CINEMAX",
      logoBg: "bg-zinc-900",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/23/Cinemax_logo_2011.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-cinemax"
    },
    {
      id: "chan-starz",
      slug: "starz-edge",
      channel_slug: "starz-edge",
      name: "Starz Edge",
      category: "Movies",
      quality: "1080p HD",
      gradient: "from-slate-800 to-black",
      logoText: "STARZ",
      logoBg: "bg-black",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/29/Starz_2016.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-starz"
    },
    {
      id: "chan-cn",
      slug: "cartoon-network",
      channel_slug: "cartoon-network",
      name: "Cartoon Network",
      category: "Kids",
      quality: "1080p HD",
      gradient: "from-slate-900 to-slate-800",
      logoText: "CARTOON NETWORK",
      logoBg: "bg-slate-950",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/8/80/Cartoon_Network_2010_logo.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-cartoonnetwork"
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
      id: "chan-nickelodeon",
      slug: "nickelodeon",
      channel_slug: "nickelodeon",
      name: "Nickelodeon",
      category: "Kids",
      quality: "1080p HD",
      gradient: "from-orange-600 to-amber-700",
      logoText: "NICKELODEON",
      logoBg: "bg-orange-600",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7a/Nickelodeon_2009_logo.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-nickelodeon"
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
    },
    {
      id: "chan-mtv",
      slug: "mtv-live-hd",
      channel_slug: "mtv-live-hd",
      name: "MTV Live HD",
      category: "Entertainment",
      quality: "1080p HD",
      gradient: "from-teal-600 to-slate-900",
      logoText: "MTV LIVE",
      logoBg: "bg-teal-700",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d6/MTV_Logo_2021.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-mtv"
    },
    {
      id: "chan-discovery",
      slug: "discovery-channel",
      channel_slug: "discovery-channel",
      name: "Discovery Channel HD",
      category: "Entertainment",
      quality: "1080p HD",
      gradient: "from-blue-800 to-indigo-950",
      logoText: "DISCOVERY",
      logoBg: "bg-blue-900",
      logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/26/Discovery_Channel_2019.svg",
      streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-discovery"
    }
  ];

  const filteredChannels = selectedChannelCategory === "All"
    ? channels
    : channels.filter((c) => c.category === selectedChannelCategory);

  return (
    <div className="w-full space-y-7 text-slate-900">
      {/* Toast Alert Banner for VIP Access */}
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
                You're on the live stream notification list! You will receive instant push notifications as match kickoffs begin.
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

      {/* 1. TOP HERO SECTION: "Live & Upcoming Fixtures" */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-100 text-rose-600 rounded-xl">
              <AnimatedFlame className="w-5 h-5 text-rose-600 fill-rose-600" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Live & Upcoming Fixtures
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Tap any fixture card to launch direct live video stream
              </p>
            </div>
          </div>

          <button
            onClick={handleAlertClick}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Notify Kickoffs</span>
          </button>
        </div>

        {/* Carousel of Match Cards */}
        <div className="flex gap-3.5 overflow-x-auto pb-3 pt-1 px-1 hide-scrollbar snap-x">
          {fixtures.map((fix) => (
            <motion.div
              key={fix.id}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={() => handleLaunchFixture(fix)}
              className="snap-start shrink-0 min-w-[280px] xs:min-w-[300px] sm:min-w-[320px] bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-lg transition-all p-4 cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              {/* Badge & League Header */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-extrabold text-slate-500 tracking-tight uppercase truncate">
                  {fix.league}
                </span>

                {fix.isLive ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                    • LIVE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-extrabold text-[10px] uppercase tracking-wider">
                    {fix.status}
                  </span>
                )}
              </div>

              {/* Team vs Team Comparison Layout */}
              <div className="flex items-center justify-between gap-3 py-2 px-1">
                {/* Home Team */}
                <div className="flex flex-col items-center text-center space-y-1.5 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5 overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
                    <img 
                      src={fix.homeTeam.logo} 
                      alt={fix.homeTeam.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback text avatar if image fails
                        (e.target as HTMLElement).style.display = 'none';
                        if ((e.target as HTMLElement).parentElement) {
                          (e.target as HTMLElement).parentElement!.innerText = fix.homeTeam.short;
                        }
                      }}
                    />
                  </div>
                  <span className="text-xs font-black text-slate-900 truncate max-w-[100px]">
                    {fix.homeTeam.name}
                  </span>
                </div>

                {/* VS Badge */}
                <div className="flex flex-col items-center justify-center shrink-0">
                  <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-black text-[10px] flex items-center justify-center shadow-xs">
                    VS
                  </span>
                  <span className="text-[10px] font-bold text-rose-600 mt-1">
                    {fix.time}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center text-center space-y-1.5 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full border border-slate-200 bg-slate-50 flex items-center justify-center p-1.5 overflow-hidden shadow-xs group-hover:scale-105 transition-transform">
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
                  <span className="text-xs font-black text-slate-900 truncate max-w-[100px]">
                    {fix.awayTeam.name}
                  </span>
                </div>
              </div>

              {/* Match Title & Play Trigger */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-slate-800 truncate">
                  {fix.title}
                </h3>
                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 group-hover:bg-indigo-700 transition-colors">
                  <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
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
            <motion.div
              key={chan.id}
              whileHover={{ y: -3, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
                    // Fallback to text logo if SVG fails
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
            </motion.div>
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
          onClick={handleAlertClick}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl shrink-0 transition-colors cursor-pointer"
        >
          Check Stream Status
        </button>
      </div>
    </div>
  );
}
