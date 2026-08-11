// Every type here mirrors an actual backend response shape from server.js.
// Keeping these in sync with reality (not aspirational) is the whole point
// of doing this in TypeScript — a field that's actually optional should be
// typed optional, not assumed present.

export interface ApiEnvelope<T> {
  data: T;
  lastUpdated: string | null;
  error: string | null;
}

// ---- Earthquakes (USGS) ----
export interface Quake {
  mag: number;
  place: string;
  time: number; // epoch ms, as sent by USGS — converted to a display string client-side
  url: string;
  lon: number;
  lat: number;
  depth: number;
}

// ---- Fires (NASA FIRMS) ----
// brightness/frp can legitimately be null — confirmed in production: NaN from
// a missing CSV field becomes null once it round-trips through JSON.
export interface Fire {
  lat: number;
  lon: number;
  brightness: number | null;
  frp: number | null;
  confidence: string;
  satellite: string;
  date: string;
  time: string;
}

// ---- CVEs (NVD) ----
export interface Cve {
  id: string;
  description: string;
  severity: string;
  score: number | null;
  published: string;
}

// ---- Threat actors (MITRE ATT&CK) ----
export interface ThreatActor {
  name: string;
  aliases: string[];
  description: string;
  mitreId: string;
  modified: string;
}

// ---- Breaches (HaveIBeenPwned) ----
export interface Breach {
  headline: string;
  src: string;
  url: string;
  date: string;
  verified: boolean;
  sensitive: boolean;
}

// ---- Generic "article" shape shared by world-news, sanctions-news, zone
// dossiers, and relief-reports — all of these ultimately return this ----
export interface Article {
  headline: string;
  src: string;
  url?: string;
  date: string;
}

// ---- The 15 curated conflict zones ----
export type ZoneTier = 'conflict' | 'unrest' | 'watch';

export interface ConflictZone {
  name: string;
  status: string;
  tier: ZoneTier;
  coord: { lat: number; lon: number };
}

export interface ZonesResponse {
  zones: ConflictZone[];
  articles: ApiEnvelope<Record<string, Article[]>>;
}

// ---- Dynamic (any-country) detection ----
export interface DynamicCountry {
  code: string;
  name: string;
  lat: number;
  lon: number;
  tier: ZoneTier;
  articles: Article[];
}
