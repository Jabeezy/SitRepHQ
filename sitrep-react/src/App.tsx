import { useState } from 'react';
import { useLiveData } from './api/useLiveData';
import { api } from './api/client';
import MapView from './components/MapView';
import type { Quake, Fire, ZonesResponse, DynamicCountry } from './types';
import './App.css';

type LayerKey = 'zones' | 'dynamic' | 'quakes' | 'fires';

export default function App() {
  const quakes = useLiveData<Quake[]>(
    async () => {
      const res = await api.earthquakes();
      return { data: res.data, error: res.error };
    },
    90_000,
    'quakes'
  );

  const fires = useLiveData<Fire[]>(
    async () => {
      const res = await api.fires();
      return { data: res.data, error: res.error };
    },
    30 * 60_000,
    'fires'
  );

  const zonesData = useLiveData<ZonesResponse>(
    async () => {
      const res = await api.zones();
      return { data: res, error: res.articles.error };
    },
    20 * 60_000,
    'zones'
  );

  const dynamicCountries = useLiveData<DynamicCountry[]>(
    async () => {
      const res = await api.dynamicWorldEvents();
      return { data: res.data, error: res.error };
    },
    15 * 60_000,
    'dynamic-world'
  );

  // Layer toggle selector — same decluttering control as the vanilla version,
  // now driven by real React state instead of manually flipping CSS display.
  const [visibleLayers, setVisibleLayers] = useState<Record<LayerKey, boolean>>({
    zones: true,
    dynamic: true,
    quakes: true,
    fires: true,
  });
  function toggleLayer(key: LayerKey) {
    setVisibleLayers(prev => ({ ...prev, [key]: !prev[key] }));
  }

  const anyError = quakes.error || zonesData.error || dynamicCountries.error;

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
            <span className={`live-dot ${anyError ? 'error' : ''}`} />
            {quakes.loading ? 'CONNECTING...' : 'LIVE'}
          </div>
        </div>
      </header>

      <div className="map-frame">
        <MapView
          quakes={visibleLayers.quakes ? quakes.data ?? [] : []}
          zones={visibleLayers.zones ? zonesData.data?.zones ?? [] : []}
          zoneArticles={zonesData.data?.articles.data ?? {}}
          dynamicCountries={visibleLayers.dynamic ? dynamicCountries.data ?? [] : []}
          fires={visibleLayers.fires ? fires.data ?? [] : []}
        />

        <div className="layer-toggles">
          {(['zones', 'dynamic', 'quakes', 'fires'] as LayerKey[]).map(key => (
            <button
              key={key}
              className={`layer-btn ${visibleLayers[key] ? 'active' : ''}`}
              onClick={() => toggleLayer(key)}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <footer className="app-footer">
        {quakes.data ? `LIVE — ${quakes.data.length} M4.5+ QUAKES (24H) — USGS` : 'CONNECTING TO USGS...'}
        {' · '}
        {zonesData.data ? `${zonesData.data.zones.length} CURATED ZONES` : 'LOADING ZONES...'}
        {' · '}
        {dynamicCountries.data ? `${dynamicCountries.data.length} AUTO-DETECTED` : 'LOADING DETECTION...'}
        {' · '}
        {fires.data ? `${fires.data.length} THERMAL ANOMALIES` : fires.error ? 'FIRMS NOT CONFIGURED' : 'LOADING FIRES...'}
      </footer>
    </div>
  );
}