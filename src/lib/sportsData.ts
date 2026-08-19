import { Fixture } from "../types/sports";

export const INITIAL_FIXTURES: Fixture[] = [
  {
    id: "fix-ars-che",
    slug: "live-arsenal-chelsea",
    channel_slug: "live-arsenal-chelsea",
    title: "Arsenal vs Chelsea",
    sport: "Football",
    league: "Premier League",
    status: "LIVE",
    time: "67' 2nd Half",
    isLive: true,
    venue: "Emirates Stadium, London",
    homeTeam: {
      name: "Arsenal",
      short: "ARS",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png",
      color: "bg-red-600",
      score: 2
    },
    awayTeam: {
      name: "Chelsea",
      short: "CHE",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/363.png",
      color: "bg-blue-700",
      score: 1
    },
    streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-arsenal-chelsea",
    sources: [
      {
        id: "src-ars-1",
        name: "Sky Sports Main Feed (English HD)",
        language: "English",
        quality: "1080p 60fps",
        latency: "Ultra-Low (0.8s)",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-arsenal-chelsea",
        isDirectHls: true
      },
      {
        id: "src-ars-2",
        name: "SuperSport Premier League (Swahili / Eng)",
        language: "Swahili / English",
        quality: "1080p HD",
        latency: "Low (1.2s)",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-supersport",
        isDirectHls: true
      },
      {
        id: "src-ars-3",
        name: "BexyTV Sports Mirror Backup",
        language: "International",
        quality: "720p HD",
        latency: "Standard (2.0s)",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=bexytv-mirror",
        isDirectHls: true
      }
    ],
    events: [
      { minute: "14'", type: "goal", team: "home", player: "Bukayo Saka", description: "Curling left foot shot from box corner" },
      { minute: "38'", type: "card", team: "away", player: "Moises Caicedo", description: "Tactical foul" },
      { minute: "52'", type: "goal", team: "away", player: "Cole Palmer", description: "Penalty kick into top corner" },
      { minute: "63'", type: "goal", team: "home", player: "Kai Havertz", description: "Header from corner delivery" }
    ],
    stats: [
      { label: "Possession %", home: "58%", away: "42%" },
      { label: "Shots on Target", home: 7, away: 4 },
      { label: "Total Shots", home: 14, away: 9 },
      { label: "Corner Kicks", home: 6, away: 3 },
      { label: "Fouls Committed", home: 8, away: 11 },
      { label: "Yellow Cards", home: 1, away: 2 }
    ],
    lineups: {
      formationHome: "4-3-3",
      formationAway: "4-2-3-1",
      homeStarters: ["Raya", "White", "Saliba", "Gabriel", "Timber", "Partey", "Rice", "Odegaard", "Saka", "Havertz", "Martinelli"],
      awayStarters: ["Sanchez", "Gusto", "Fofana", "Colwill", "Cucurella", "Caicedo", "Lavia", "Madueke", "Palmer", "Neto", "Jackson"]
    },
    votes: { home: 1840, draw: 320, away: 940 }
  },
  {
    id: "fix-simba-yanga",
    slug: "live-simba-yanga",
    channel_slug: "live-simba-yanga",
    title: "Simba SC vs Young Africans (Kariakoo Derby)",
    sport: "Football",
    league: "NBC Premier League (TZ)",
    status: "LIVE",
    time: "54' 2nd Half",
    isLive: true,
    venue: "Benjamin Mkapa Stadium, Dar es Salaam",
    homeTeam: {
      name: "Simba SC",
      short: "SIM",
      logo: "https://upload.wikimedia.org/wikipedia/en/e/e0/Simba_SC_logo.png",
      color: "bg-red-700",
      score: 1
    },
    awayTeam: {
      name: "Young Africans SC",
      short: "YAN",
      logo: "https://upload.wikimedia.org/wikipedia/en/4/47/Young_Africans_SC_logo.png",
      color: "bg-emerald-700",
      score: 1
    },
    streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-simba-yanga",
    sources: [
      {
        id: "src-kariakoo-1",
        name: "Azam Sports 1 HD (Swahili Feed)",
        language: "Kiswahili",
        quality: "1080p HD",
        latency: "Ultra-Low (0.5s)",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-supersport",
        isDirectHls: true
      },
      {
        id: "src-kariakoo-2",
        name: "SuperSport Africa Feed",
        language: "English / Swahili",
        quality: "1080p HD",
        latency: "Low (1.0s)",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=freegotv-relay",
        isDirectHls: true
      }
    ],
    events: [
      { minute: "22'", type: "goal", team: "away", player: "Pacome Zouzoua", description: "Long range strike from 25 yards" },
      { minute: "41'", type: "card", team: "home", player: "Fabrice Ngoma", description: "Yellow card" },
      { minute: "49'", type: "goal", team: "home", player: "Jean Ahoua", description: "Free kick into top right bin" }
    ],
    stats: [
      { label: "Possession %", home: "49%", away: "51%" },
      { label: "Shots on Target", home: 5, away: 6 },
      { label: "Total Shots", home: 11, away: 12 },
      { label: "Corner Kicks", home: 4, away: 5 },
      { label: "Fouls Committed", home: 15, away: 17 },
      { label: "Yellow Cards", home: 2, away: 3 }
    ],
    lineups: {
      formationHome: "4-3-3",
      formationAway: "4-2-3-1",
      homeStarters: ["Camara", "Kapombe", "Che Malone", "Hamuza", "Zimbwe Jr", "Ngoma", "Fernandez", "Ahoua", "Kibu Denis", "Ateba", "Balua"],
      awayStarters: ["Diarra", "Yao", "Bacca", "Job", "Boka", "Aucho", "Mudathir", "Maxi Nzengeli", "Pacome", "Dube", "Musonda"]
    },
    votes: { home: 4120, draw: 1200, away: 4350 }
  },
  {
    id: "fix-rma-bar",
    slug: "live-real-barca",
    channel_slug: "live-real-barca",
    title: "Real Madrid vs FC Barcelona (El Clásico)",
    sport: "Football",
    league: "La Liga",
    status: "LIVE",
    time: "38' 1st Half",
    isLive: true,
    venue: "Santiago Bernabéu, Madrid",
    homeTeam: {
      name: "Real Madrid",
      short: "RMA",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/86.png",
      color: "bg-slate-900",
      score: 1
    },
    awayTeam: {
      name: "FC Barcelona",
      short: "BAR",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/83.png",
      color: "bg-blue-900",
      score: 0
    },
    streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-real-barca",
    sources: [
      {
        id: "src-clasico-1",
        name: "DAZN LaLiga Ultra 4K (English / Spanish)",
        language: "English / Spanish",
        quality: "4K 60fps",
        latency: "Ultra-Low (0.6s)",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-real-barca",
        isDirectHls: true
      },
      {
        id: "src-clasico-2",
        name: "ESPN+ Official Mirror",
        language: "English",
        quality: "1080p HD",
        latency: "Low (1.1s)",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-espn",
        isDirectHls: true
      }
    ],
    events: [
      { minute: "19'", type: "goal", team: "home", player: "Kylian Mbappé", description: "Fast breakaway finish past keeper" },
      { minute: "32'", type: "card", team: "away", player: "Gavi", description: "Late challenge" }
    ],
    stats: [
      { label: "Possession %", home: "44%", away: "56%" },
      { label: "Shots on Target", home: 4, away: 2 },
      { label: "Total Shots", home: 8, away: 6 },
      { label: "Corner Kicks", home: 3, away: 4 },
      { label: "Fouls Committed", home: 7, away: 9 },
      { label: "Yellow Cards", home: 0, away: 1 }
    ],
    lineups: {
      formationHome: "4-3-1-2",
      formationAway: "4-3-3",
      homeStarters: ["Courtois", "Vazquez", "Militao", "Rudiger", "Mendy", "Valverde", "Tchouameni", "Camavinga", "Bellingham", "Vinicius Jr", "Mbappe"],
      awayStarters: ["Pena", "Kounde", "Cubarsi", "Martinez", "Balde", "Casado", "Pedri", "Gavi", "Yamal", "Lewandowski", "Raphinha"]
    },
    votes: { home: 3200, draw: 890, away: 2890 }
  },
  {
    id: "fix-gsw-lal",
    slug: "live-gsw-lakers",
    channel_slug: "live-gsw-lakers",
    title: "Golden State Warriors vs LA Lakers",
    sport: "Basketball",
    league: "NBA",
    status: "LIVE",
    time: "3rd Qtr • 04:12",
    isLive: true,
    venue: "Chase Center, San Francisco",
    homeTeam: {
      name: "GS Warriors",
      short: "GSW",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/gsw.png",
      color: "bg-blue-600",
      score: 84
    },
    awayTeam: {
      name: "LA Lakers",
      short: "LAL",
      logo: "https://a.espncdn.com/i/teamlogos/nba/500/lal.png",
      color: "bg-purple-700",
      score: 81
    },
    streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-gsw-lakers",
    sources: [
      {
        id: "src-nba-1",
        name: "TNT Sports HD Feed",
        language: "English",
        quality: "1080p 60fps",
        latency: "Ultra-Low",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-gsw-lakers",
        isDirectHls: true
      },
      {
        id: "src-nba-2",
        name: "NBA League Pass Direct",
        language: "English",
        quality: "1080p HD",
        latency: "Low",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=bexytv-mirror",
        isDirectHls: true
      }
    ],
    events: [
      { minute: "Q3 04:12", type: "point", team: "home", player: "Stephen Curry", description: "Deep 3-pointer stepback" },
      { minute: "Q3 05:40", type: "point", team: "away", player: "LeBron James", description: "Driving slam dunk" },
      { minute: "Q2 00:03", type: "point", team: "home", player: "Buddy Hield", description: "Buzzer beater 3PT" }
    ],
    stats: [
      { label: "Field Goal %", home: "48.5%", away: "46.2%" },
      { label: "3-Pointers Made", home: "14/32", away: "9/24" },
      { label: "Rebounds", home: 38, away: 42 },
      { label: "Assists", home: 24, away: 19 },
      { label: "Turnovers", home: 7, away: 11 }
    ],
    votes: { home: 2410, draw: 0, away: 2280 }
  },
  {
    id: "fix-mci-liv",
    slug: "live-mci-liv",
    channel_slug: "live-mci-liv",
    title: "Manchester City vs Liverpool",
    sport: "Football",
    league: "Premier League",
    status: "UPCOMING",
    time: "Today • 22:00 EAT",
    isLive: false,
    venue: "Etihad Stadium, Manchester",
    homeTeam: {
      name: "Man City",
      short: "MCI",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png",
      color: "bg-sky-500",
      score: 0
    },
    awayTeam: {
      name: "Liverpool",
      short: "LIV",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/364.png",
      color: "bg-red-700",
      score: 0
    },
    streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-mci-liv",
    sources: [
      {
        id: "src-mci-1",
        name: "Sky Sports Main Event HD",
        language: "English",
        quality: "1080p 60fps",
        latency: "Scheduled",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-mci-liv",
        isDirectHls: true
      },
      {
        id: "src-mci-2",
        name: "SuperSport Grandstand",
        language: "English / Swahili",
        quality: "1080p HD",
        latency: "Scheduled",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-supersport",
        isDirectHls: true
      }
    ],
    stats: [
      { label: "Head-to-Head (Last 5)", home: "2 Wins", away: "2 Wins (1 Draw)" },
      { label: "League Position", home: "2nd (58 pts)", away: "1st (61 pts)" },
      { label: "Top Scorer", home: "Erling Haaland (21)", away: "Mohamed Salah (19)" }
    ],
    votes: { home: 1650, draw: 720, away: 1590 }
  },
  {
    id: "fix-bm-psg",
    slug: "live-bm-psg",
    channel_slug: "live-bm-psg",
    title: "Bayern Munich vs Paris Saint-Germain",
    sport: "Football",
    league: "UEFA Champions League",
    status: "UPCOMING",
    time: "Tomorrow • 23:00 EAT",
    isLive: false,
    venue: "Allianz Arena, Munich",
    homeTeam: {
      name: "Bayern Munich",
      short: "BAY",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/132.png",
      color: "bg-red-600",
      score: 0
    },
    awayTeam: {
      name: "Paris Saint-Germain",
      short: "PSG",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/160.png",
      color: "bg-blue-900",
      score: 0
    },
    streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-bm-psg",
    sources: [
      {
        id: "src-ucl-1",
        name: "TNT Sports Champions League HD",
        language: "English",
        quality: "4K HDR",
        latency: "Scheduled",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-bm-psg",
        isDirectHls: true
      }
    ],
    votes: { home: 1980, draw: 410, away: 1420 }
  },
  {
    id: "fix-f1-monaco",
    slug: "live-f1-grand-prix",
    channel_slug: "live-f1-grand-prix",
    title: "Formula 1 Grand Prix • Main Race",
    sport: "Motorsport",
    league: "Formula 1",
    status: "UPCOMING",
    time: "Sunday • 16:00 EAT",
    isLive: false,
    venue: "Circuit de Monaco, Monte Carlo",
    homeTeam: {
      name: "Max Verstappen (Red Bull)",
      short: "VER",
      logo: "https://a.espncdn.com/i/teamlogos/f1/500/red_bull.png",
      color: "bg-blue-900"
    },
    awayTeam: {
      name: "Lewis Hamilton (Ferrari)",
      short: "HAM",
      logo: "https://a.espncdn.com/i/teamlogos/f1/500/ferrari.png",
      color: "bg-red-700"
    },
    streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=streameast-backup",
    sources: [
      {
        id: "src-f1-1",
        name: "Sky Sports F1 HD (Onboard Cameras)",
        language: "English",
        quality: "1080p 60fps",
        latency: "Scheduled",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=streameast-backup",
        isDirectHls: true
      }
    ],
    votes: { home: 3120, draw: 0, away: 2840 }
  },
  {
    id: "fix-ufc-main",
    slug: "live-ufc-championship",
    channel_slug: "live-ufc-championship",
    title: "UFC Championship: Makhachev vs Tsarukyan 2",
    sport: "Combat",
    league: "UFC",
    status: "UPCOMING",
    time: "Saturday • 05:00 EAT",
    isLive: false,
    venue: "T-Mobile Arena, Las Vegas",
    homeTeam: {
      name: "Islam Makhachev (C)",
      short: "MAK",
      logo: "https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/3153839.png&w=350&h=254",
      color: "bg-slate-900"
    },
    awayTeam: {
      name: "Arman Tsarukyan (#1)",
      short: "TSA",
      logo: "https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4405527.png&w=350&h=254",
      color: "bg-red-800"
    },
    streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=streameast-backup",
    sources: [
      {
        id: "src-ufc-1",
        name: "ESPN+ PPV Official Stream",
        language: "English",
        quality: "1080p HD",
        latency: "Scheduled",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=streameast-backup",
        isDirectHls: true
      }
    ],
    votes: { home: 2780, draw: 120, away: 1910 }
  },
  {
    id: "fix-inter-juve",
    slug: "live-inter-juve",
    channel_slug: "live-inter-juve",
    title: "Inter Milan vs Juventus (Derby d'Italia)",
    sport: "Football",
    league: "Serie A",
    status: "FINISHED",
    time: "FT (Full Time)",
    isLive: false,
    venue: "San Siro, Milan",
    homeTeam: {
      name: "Inter Milan",
      short: "INT",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/110.png",
      color: "bg-blue-800",
      score: 3
    },
    awayTeam: {
      name: "Juventus",
      short: "JUV",
      logo: "https://a.espncdn.com/i/teamlogos/soccer/500/111.png",
      color: "bg-black",
      score: 2
    },
    streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-cbssports",
    sources: [
      {
        id: "src-seriea-1",
        name: "Paramount+ Replay HD",
        language: "English / Italian",
        quality: "1080p HD",
        latency: "Replay",
        streamUrl: "https://huncho-tv-backend.onrender.com/api/v1/proxy-hls?imdb_id=live-cbssports",
        isDirectHls: true
      }
    ],
    events: [
      { minute: "12'", type: "goal", team: "home", player: "Lautaro Martinez" },
      { minute: "28'", type: "goal", team: "away", player: "Dusan Vlahovic" },
      { minute: "61'", type: "goal", team: "home", player: "Marcus Thuram" },
      { minute: "76'", type: "goal", team: "away", player: "Kenan Yildiz" },
      { minute: "88'", type: "goal", team: "home", player: "Nicolo Barella" }
    ],
    stats: [
      { label: "Possession %", home: "52%", away: "48%" },
      { label: "Shots on Target", home: 8, away: 6 },
      { label: "Corner Kicks", home: 7, away: 4 }
    ],
    votes: { home: 2100, draw: 600, away: 1800 }
  }
];
