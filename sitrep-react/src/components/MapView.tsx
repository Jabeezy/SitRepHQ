import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Quake, Fire, ConflictZone, DynamicCountry, ZoneTier, Article } from '../types';
import type { DossierData } from './Dossier';

interface MapViewProps {
  quakes: Quake[];
  zones: ConflictZone[];
  zoneArticles: Record<string, Article[]>;
  dynamicCountries: DynamicCountry[];
  fires: Fire[];
  onSelect: (data: DossierData) => void;
  resizeKey?: unknown; // pass something that changes (e.g. panelOpen) to trigger a map resize recalculation
}

// Leaflet caches its internal render size when the map is created — if the
// container is resized afterward via CSS (like a side panel closing), the
// map doesn't automatically know to redraw into the new space, leaving a
// blank gap. This forces Leaflet to re-measure after the layout settles.
function MapResizeHandler({ watch }: { watch: unknown }) {
  const map = useMap();
  useEffect(() => {
    const id = setTimeout(() => map.invalidateSize(), 300);
    return () => clearTimeout(id);
  }, [watch, map]);
  return null;
}

const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const TIER_COLORS: Record<ZoneTier, string> = {
  conflict: '#ff3b3b',
  unrest: '#ff9d2e',
  watch: '#2ee6ff',
};

export default function MapView({ quakes, zones, zoneArticles, dynamicCountries, fires, onSelect, resizeKey }: MapViewProps) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={1}
      worldCopyJump
      style={{ width: '100%', height: '100%', background: '#050708' }}
    >
      <TileLayer url={DARK_TILE_URL} attribution={TILE_ATTRIBUTION} />
      <MapResizeHandler watch={resizeKey} />

      {quakes.map((q, i) => (
        <CircleMarker
          key={`quake-${i}`}
          center={[q.lat, q.lon]}
          radius={Math.max(4, Math.min(14, Math.sqrt(q.mag) * 3))}
          pathOptions={{ color: '#3dff8a', fillColor: '#3dff8a', fillOpacity: 0.7, weight: 1 }}
          eventHandlers={{
            click: () => onSelect({
              name: `M${q.mag.toFixed(1)} EARTHQUAKE`,
              status: q.place,
              tier: null,
              isLive: true,
              articles: [{ headline: `Depth: ${q.depth.toFixed(1)} km`, src: 'USGS', url: q.url, date: new Date(q.time).toISOString() }],
            }),
          }}
        />
      ))}

      {zones.map((z, i) => (
        <CircleMarker
          key={`zone-${i}`}
          center={[z.coord.lat, z.coord.lon]}
          radius={8}
          pathOptions={{ color: TIER_COLORS[z.tier], fillColor: TIER_COLORS[z.tier], fillOpacity: 0.25, weight: 2 }}
          eventHandlers={{
            click: () => onSelect({
              name: z.name,
              status: z.status,
              tier: z.tier,
              isLive: (zoneArticles[z.name] ?? []).length > 0,
              articles: zoneArticles[z.name] ?? [],
            }),
          }}
        />
      ))}

      {dynamicCountries.map((c, i) => (
        <CircleMarker
          key={`dyn-${i}`}
          center={[c.lat, c.lon]}
          radius={7}
          pathOptions={{ color: TIER_COLORS[c.tier], fillColor: TIER_COLORS[c.tier], fillOpacity: 0.15, weight: 2, dashArray: '3,3' }}
          eventHandlers={{
            click: () => onSelect({
              name: c.name,
              status: 'AUTO-DETECTED — NOT A PRE-DEFINED ZONE',
              tier: c.tier,
              isLive: true,
              articles: c.articles,
            }),
          }}
        />
      ))}

      {fires.map((f, i) => (
        <CircleMarker
          key={`fire-${i}`}
          center={[f.lat, f.lon]}
          radius={f.frp ? Math.max(4, Math.min(12, Math.sqrt(f.frp) * 1.5)) : 5}
          pathOptions={{ color: '#ff9d2e', fillColor: '#ff3b3b', fillOpacity: 0.6, weight: 1 }}
          eventHandlers={{
            click: () => onSelect({
              name: 'THERMAL ANOMALY DETECTED',
              status: `Satellite ${f.satellite} · Confidence: ${f.confidence}`,
              tier: null,
              isLive: true,
              articles: [{
                headline: `Fire radiative power: ${f.frp !== null ? f.frp.toFixed(1) + ' MW' : 'not available'}`,
                src: 'NASA FIRMS',
                date: `${f.date}T${f.time.padStart(4,'0').slice(0,2)}:${f.time.padStart(4,'0').slice(2,4)}:00Z`,
              }],
            }),
          }}
        />
      ))}
    </MapContainer>
  );
}