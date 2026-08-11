import type {
  ApiEnvelope, Quake, Fire, Cve, ThreatActor, Breach, Article,
  ZonesResponse, DynamicCountry,
} from '../types';

// Same backend URL the vanilla JS version already talks to. If this ever
// moves off Railway, this is the one line that needs to change.
export const BACKEND_URL = 'https://blackwatch-production.up.railway.app';

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(BACKEND_URL + path);
  if (!res.ok) throw new Error(`Backend request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  earthquakes: () => fetchJson<ApiEnvelope<Quake[]>>('/api/earthquakes'),
  fires: () => fetchJson<ApiEnvelope<Fire[]>>('/api/fires'),
  cves: () => fetchJson<ApiEnvelope<Cve[]>>('/api/cves'),
  threatActors: () => fetchJson<ApiEnvelope<ThreatActor[]>>('/api/threat-actors'),
  breaches: () => fetchJson<ApiEnvelope<Breach[]>>('/api/breaches'),
  worldNews: () => fetchJson<ApiEnvelope<Article[]>>('/api/world-news'),
  sanctionsNews: () => fetchJson<ApiEnvelope<Article[]>>('/api/sanctions-news'),
  reliefReports: () => fetchJson<ApiEnvelope<Article[]>>('/api/relief-reports'),
  zones: () => fetchJson<ZonesResponse>('/api/zones'),
  dynamicWorldEvents: () => fetchJson<ApiEnvelope<DynamicCountry[]>>('/api/world-events-dynamic'),
  health: () => fetchJson<{ ok: boolean; time: string }>('/api/health'),
};
