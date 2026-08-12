import { useState } from 'react';
import { useLiveData } from './api/useLiveData';
import { api } from './api/client';
import MapView from './components/MapView';
import TabBar, { type Tab } from './components/TabBar';
import Dossier, { type DossierData } from './components/Dossier';
import { FeedPanel, ArticleRow, CveRow, ThreatActorRow, BreachRow } from './components/FeedPanel';
import type { Quake, Fire, ZonesResponse, DynamicCountry, Cve, ThreatActor, Breach, Article } from './types';
import './App.css';

type LayerKey = 'zones' | 'dynamic' | 'quakes' | 'fires';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [dossier, setDossier] = useState<DossierData | null>(null);
  const [panelOpen, setPanelOpen] = useState(true);

  const quakes = useLiveData<Quake[]>(async () => { const r = await api.earthquakes(); return { data: r.data, error: r.error }; }, 90_000, 'quakes');
  const fires = useLiveData<Fire[]>(async () => { const r = await api.fires(); return { data: r.data, error: r.error }; }, 30 * 60_000, 'fires');
  const zonesData = useLiveData<ZonesResponse>(async () => { const r = await api.zones(); return { data: r, error: r.articles.error }; }, 20 * 60_000, 'zones');
  const dynamicCountries = useLiveData<DynamicCountry[]>(async () => { const r = await api.dynamicWorldEvents(); return { data: r.data, error: r.error }; }, 15 * 60_000, 'dynamic-world');
  const cves = useLiveData<Cve[]>(async () => { const r = await api.cves(); return { data: r.data, error: r.error }; }, 15 * 60_000, 'cves');
  const threatActors = useLiveData<ThreatActor[]>(async () => { const r = await api.threatActors(); return { data: r.data, error: r.error }; }, 60 * 60_000, 'threat-actors');
  const breaches = useLiveData<Breach[]>(async () => { const r = await api.breaches(); return { data: r.data, error: r.error }; }, 15 * 60_000, 'breaches');
  const worldNews = useLiveData<Article[]>(async () => { const r = await api.worldNews(); return { data: r.data, error: r.error }; }, 15 * 60_000, 'world-news');
  const sanctionsNews = useLiveData<Article[]>(async () => { const r = await api.sanctionsNews(); return { data: r.data, error: r.error }; }, 15 * 60_000, 'sanctions-news');

  const [visibleLayers, setVisibleLayers] = useState<Record<LayerKey, boolean>>({ zones: true, dynamic: true, quakes: true, fires: true });
  function toggleLayer(key: LayerKey) { setVisibleLayers(prev => ({ ...prev, [key]: !prev[key] })); }

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

      <TabBar active={activeTab} onChange={setActiveTab} />

      <div className="layer-toolbar">
        {(['zones', 'dynamic', 'quakes', 'fires'] as LayerKey[]).map(key => (
          <button key={key} className={`layer-btn ${visibleLayers[key] ? 'active' : ''}`} onClick={() => toggleLayer(key)}>
            {key.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="main-content">
        <div className="map-frame">
          <MapView
            quakes={visibleLayers.quakes ? quakes.data ?? [] : []}
            zones={visibleLayers.zones ? zonesData.data?.zones ?? [] : []}
            zoneArticles={zonesData.data?.articles.data ?? {}}
            dynamicCountries={visibleLayers.dynamic ? dynamicCountries.data ?? [] : []}
            fires={visibleLayers.fires ? fires.data ?? [] : []}
            onSelect={setDossier}
            resizeKey={panelOpen}
          />
        </div>

        {panelOpen ? (
          <div className="side-panels">
            <button className="panel-close-btn" onClick={() => setPanelOpen(false)} title="Hide panel">×</button>
            {activeTab === 'overview' && (
              <>
                <FeedPanel title="CYBER THREAT FEED" loading={cves.loading} error={cves.error}>
                  {cves.data?.slice(0, 10).map((c, i) => <CveRow key={i} item={c} />)}
                </FeedPanel>
                <FeedPanel title="WORLD / GEOPOLITICAL FEED" loading={worldNews.loading} error={worldNews.error}>
                  {worldNews.data?.slice(0, 10).map((a, i) => <ArticleRow key={i} item={a} />)}
                </FeedPanel>
              </>
            )}
            {activeTab === 'darkweb' && (
              <FeedPanel title="BREACH DISCLOSURES — HAVEIBEENPWNED" loading={breaches.loading} error={breaches.error}
                emptyLabel="This tracks disclosed breaches, not live dark-web forum chatter.">
                {breaches.data?.map((b, i) => <BreachRow key={i} item={b} />)}
              </FeedPanel>
            )}
            {activeTab === 'threatactors' && (
              <FeedPanel title="THREAT ACTOR GROUPS — MITRE ATT&CK" loading={threatActors.loading} error={threatActors.error}>
                {threatActors.data?.map((t, i) => <ThreatActorRow key={i} item={t} />)}
              </FeedPanel>
            )}
            {activeTab === 'worldnews' && (
              <>
                <FeedPanel title="WORLD NEWS — GDELT / BBC" loading={worldNews.loading} error={worldNews.error}>
                  {worldNews.data?.slice(0, 10).map((a, i) => <ArticleRow key={i} item={a} />)}
                </FeedPanel>
                <FeedPanel title="SANCTIONS & EXPORT CONTROLS" loading={sanctionsNews.loading} error={sanctionsNews.error}>
                  {sanctionsNews.data?.slice(0, 10).map((a, i) => <ArticleRow key={i} item={a} />)}
                </FeedPanel>
              </>
            )}
          </div>
        ) : (
          <button className="panel-reopen-tab" onClick={() => setPanelOpen(true)} title="Show panel">‹</button>
        )}
      </div>

      <footer className="app-footer">
        {quakes.data ? `LIVE — ${quakes.data.length} M4.5+ QUAKES` : 'CONNECTING...'}
        {' · '}{zonesData.data ? `${zonesData.data.zones.length} ZONES` : 'LOADING...'}
        {' · '}{dynamicCountries.data ? `${dynamicCountries.data.length} AUTO-DETECTED` : 'LOADING...'}
        {' · '}{fires.data ? `${fires.data.length} THERMAL` : fires.error ? 'FIRMS OFF' : 'LOADING...'}
      </footer>

      <Dossier data={dossier} onClose={() => setDossier(null)} />
    </div>
  );
}