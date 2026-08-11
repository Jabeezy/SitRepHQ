import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Quake, Fire, ConflictZone, DynamicCountry, ZoneTier, Article } from '../types';

interface MapViewProps {
  quakes: Quake[];
  zones: ConflictZone[];
  zoneArticles: Record<string, Article[]>;
  dynamicCountries: DynamicCountry[];
  fires: Fire[];
}

const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// Same three-tier color coding as the vanilla version: red = active conflict,
// amber = unrest/political, cyan = organized crime/border/watch.
const TIER_COLORS: Record<ZoneTier, string> = {
  conflict: '#ff3b3b',
  unrest: '#ff9d2e',
  watch: '#2ee6ff',
};

function ArticleList({ articles }: { articles: Article[] }) {
  if (!articles.length) return <em>No live headlines available for this zone right now.</em>;
  return (
    <>
      {articles.slice(0, 3).map((a, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          {a.url ? (
            <a href={a.url} target="_blank" rel="noreferrer">{a.headline}</a>
          ) : (
            a.headline
          )}
          <div style={{ fontSize: 10, opacity: 0.7 }}>{a.src}</div>
        </div>
      ))}
    </>
  );
}

export default function MapView({ quakes, zones, zoneArticles, dynamicCountries, fires }: MapViewProps) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={1}
      worldCopyJump
      style={{ width: '100%', height: '100%', background: '#050708' }}
    >
      <TileLayer url={DARK_TILE_URL} attribution={TILE_ATTRIBUTION} />

      {/* Earthquakes — real-time USGS */}
      {quakes.map((q, i) => (
        <CircleMarker
          key={`quake-${i}`}
          center={[q.lat, q.lon]}
          radius={Math.max(4, Math.min(14, Math.sqrt(q.mag) * 3))}
          pathOptions={{ color: '#3dff8a', fillColor: '#3dff8a', fillOpacity: 0.7, weight: 1 }}
        >
          <Popup>
            <strong>M{q.mag.toFixed(1)}</strong> — {q.place}
            <br />
            Depth: {q.depth.toFixed(1)} km
            <br />
            <a href={q.url} target="_blank" rel="noreferrer">View on USGS →</a>
          </Popup>
        </CircleMarker>
      ))}

      {/* Curated conflict zones — 15 hand-verified locations */}
      {zones.map((z, i) => (
        <CircleMarker
          key={`zone-${i}`}
          center={[z.coord.lat, z.coord.lon]}
          radius={8}
          pathOptions={{ color: TIER_COLORS[z.tier], fillColor: TIER_COLORS[z.tier], fillOpacity: 0.25, weight: 2 }}
        >
          <Popup minWidth={220}>
            <strong style={{ color: TIER_COLORS[z.tier] }}>{z.name}</strong>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 8 }}>{z.status}</div>
            <ArticleList articles={zoneArticles[z.name] ?? []} />
          </Popup>
        </CircleMarker>
      ))}

      {/* Dynamic — any country GDELT/BBC actually detects right now, not a fixed list */}
      {dynamicCountries.map((c, i) => (
        <CircleMarker
          key={`dyn-${i}`}
          center={[c.lat, c.lon]}
          radius={7}
          pathOptions={{ color: TIER_COLORS[c.tier], fillColor: TIER_COLORS[c.tier], fillOpacity: 0.15, weight: 2, dashArray: '3,3' }}
        >
          <Popup minWidth={220}>
            <strong style={{ color: TIER_COLORS[c.tier] }}>{c.name}</strong>
            <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 8 }}>AUTO-DETECTED · NOT A PRE-DEFINED ZONE</div>
            <ArticleList articles={c.articles} />
          </Popup>
        </CircleMarker>
      ))}

      {/* Fires — NASA FIRMS thermal detections */}
      {fires.map((f, i) => (
        <CircleMarker
          key={`fire-${i}`}
          center={[f.lat, f.lon]}
          radius={f.frp ? Math.max(4, Math.min(12, Math.sqrt(f.frp) * 1.5)) : 5}
          pathOptions={{ color: '#ff9d2e', fillColor: '#ff3b3b', fillOpacity: 0.6, weight: 1 }}
        >
          <Popup>
            <strong>Thermal anomaly</strong>
            <br />
            FRP: {f.frp !== null ? `${f.frp.toFixed(1)} MW` : 'not available'}
            <br />
            Brightness: {f.brightness !== null ? `${f.brightness.toFixed(1)} K` : 'not available'}
            <br />
            Satellite: {f.satellite} · Confidence: {f.confidence}
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}