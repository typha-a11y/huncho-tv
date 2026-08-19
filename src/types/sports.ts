export type FixtureStatus = "LIVE" | "UPCOMING" | "FINISHED";

export type SportCategory = 
  | "All" 
  | "Football" 
  | "Basketball" 
  | "Baseball" 
  | "Motorsport" 
  | "Combat" 
  | "Tennis";

export type LeagueName = 
  | "Premier League" 
  | "La Liga" 
  | "UEFA Champions League" 
  | "Serie A" 
  | "NBC Premier League (TZ)" 
  | "NBA" 
  | "MLB" 
  | "Formula 1" 
  | "UFC";

export interface TeamInfo {
  name: string;
  short: string;
  logo: string;
  color?: string;
  score?: number;
}

export interface MatchEvent {
  minute: string;
  type: "goal" | "card" | "sub" | "point";
  team: "home" | "away";
  player: string;
  description?: string;
}

export interface MatchStat {
  label: string;
  home: number | string;
  away: number | string;
}

export interface StreamSource {
  id: string;
  name: string;
  language: string;
  quality: string;
  latency: string;
  streamUrl: string;
  isDirectHls?: boolean;
}

export interface Fixture {
  id: string;
  slug: string;
  channel_slug: string;
  title: string;
  sport: SportCategory;
  league: LeagueName | string;
  leagueIcon?: string;
  status: FixtureStatus;
  time: string; // e.g. "68'", "Today 22:00 EAT", "FT"
  isLive: boolean;
  venue?: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  streamUrl: string;
  sources: StreamSource[];
  events?: MatchEvent[];
  stats?: MatchStat[];
  lineups?: {
    formationHome?: string;
    formationAway?: string;
    homeStarters?: string[];
    awayStarters?: string[];
  };
  votes?: {
    home: number;
    draw: number;
    away: number;
  };
}
