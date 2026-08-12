import type { Article, ZoneTier } from '../types';
import { ArticleRow } from './FeedPanel';

export interface DossierData {
  name: string;
  status: string;
  tier: ZoneTier | null;
  articles: Article[];
  isLive: boolean; // true = real fetched articles, false = no live data available
}

const TIER_COLORS: Record<ZoneTier, string> = {
  conflict: '#ff3b3b',
  unrest: '#ff9d2e',
  watch: '#2ee6ff',
};

interface DossierProps {
  data: DossierData | null;
  onClose: () => void;
}

export default function Dossier({ data, onClose }: DossierProps) {
  if (!data) return null;
  const color = data.tier ? TIER_COLORS[data.tier] : '#2ee6ff';

  return (
    <div className="dossier-overlay" onClick={onClose}>
      <div className="dossier" style={{ borderColor: color }} onClick={e => e.stopPropagation()}>
        <div className="dossier-header">
          <div>
            <div className="dossier-name" style={{ color }}>{data.name}</div>
            <div className="dossier-status">{data.status}</div>
          </div>
          <button className="dossier-close" onClick={onClose}>×</button>
        </div>
        <div className="dossier-label">INTEL DOSSIER — RECENT COVERAGE</div>
        <div className="dossier-body">
          {data.articles.length > 0
            ? data.articles.slice(0, 4).map((a, i) => <ArticleRow key={i} item={a} />)
            : <div className="feed-empty">No live headlines available for this location right now.</div>}
        </div>
        <div className="dossier-footer">
          {data.isLive ? 'LIVE — REAL DATA' : 'NO LIVE FEED AVAILABLE FOR THIS ITEM RIGHT NOW'}
        </div>
      </div>
    </div>
  );
}