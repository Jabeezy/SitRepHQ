import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Quake } from '../types';

interface MapViewProps {
  quakes: Quake[];
}

// CartoDB's Dark Matter tiles — free, no API key, real cartographic labels
// already baked into the tile data (this is the whole reason for this
// migration: no more hand-positioned text that overlaps when the map gets
// busy — the tile provider already solved label placement).
const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

export default function MapView({ quakes }: MapViewProps) {
  return (
    <MapContainer
      center={[20, 0]}
      zoom={2}
      minZoom={1}
      worldCopyJump
      style={{ width: '100%', height: '100%', background: '#050708' }}
    >
      <TileLayer url={DARK_TILE_URL} attribution={TILE_ATTRIBUTION} />

      {quakes.map((q, i) => (
        <CircleMarker
          key={i}
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
    </MapContainer>
  );
}
