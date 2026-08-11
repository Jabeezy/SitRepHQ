import { useLiveData } from './api/useLiveData';
import { api } from './api/client';
import MapView from './components/MapView';
import type { Quake } from './types';
import './App.css';

export default function App() {
  // Phase 1 proof-of-concept: one real live data source wired end-to-end
  // through the new React architecture. Zones, dynamic countries, fires,
  // and the dossier modal follow in the next phase once this foundation is
  // confirmed solid.
  const quakes = useLiveData<Quake[]>(
    async () => {
      const res = await api.earthquakes();
      return { data: res.data, error: res.error };
    },
    90_000,
    'quakes'
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="logo-group">
          <img src="/logo-header.png" alt="SITREP HQ" className="logo-badge" />
          <div className="logo-text">
            <div className="logo">SITREP HQ</div>
            <span className="sub">UNIFIED SITUATIONAL AWARENESS · SOC-01 (REACT REBUILD)</span>
          </div>
        </div>
        <div className="hud-stats">
          <div className="hud-stat">
            <span className={`live-dot ${quakes.error ? 'error' : ''}`} />
            {quakes.loading ? 'CONNECTING...' : quakes.error ? 'DEGRADED' : 'LIVE'}
          </div>
        </div>
      </header>

      <div className="map-frame">
        <MapView quakes={quakes.data ?? []} />
      </div>

      <footer className="app-footer">
        {quakes.data
          ? `LIVE — ${quakes.data.length} M4.5+ QUAKES (24H) — USGS`
          : quakes.error
            ? `BACKEND UNREACHABLE: ${quakes.error}`
            : 'CONNECTING TO USGS...'}
      </footer>
    </div>
  );
}
