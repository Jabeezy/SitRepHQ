import type { ReactNode } from 'react';
import type { Article, Cve, ThreatActor, Breach } from '../types';

// Formats an ISO-ish date string as a relative "Xh ago" / "Xd ago" label.
// Handles both real ISO dates and GDELT's compact "YYYYMMDDTHHMMSSZ" format.
export function timeAgo(dateStr: string): string {
  let date: Date;
  if (/^\d{8}T\d{6}Z$/.test(dateStr)) {
    const iso = `${dateStr.slice(0,4)}-${dateStr.slice(4,6)}-${dateStr.slice(6,8)}T${dateStr.slice(9,11)}:${dateStr.slice(11,13)}:${dateStr.slice(13,15)}Z`;
    date = new Date(iso);
  } else {
    date = new Date(dateStr);
  }
  if (isNaN(date.getTime())) return '';
  const diffMs = Date.now() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface FeedPanelProps {
  title: string;
  loading: boolean;
  error: string | null;
  emptyLabel?: string;
  children: ReactNode;
}

export function FeedPanel({ title, loading, error, emptyLabel, children }: FeedPanelProps) {
  return (
    <div className="feed-panel">
      <div className="feed-panel-title">{title}</div>
      <div className="feed-panel-body">
        {loading && <div className="feed-empty">Loading...</div>}
        {!loading && error && <div className="feed-empty feed-error">{error}</div>}
        {!loading && !error && children}
        {!loading && !error && !children && <div className="feed-empty">{emptyLabel ?? 'No data available right now.'}</div>}
      </div>
    </div>
  );
}

export function ArticleRow({ item }: { item: Article }) {
  return (
    <div className="feed-item">
      <div className="feed-item-headline">
        {item.url ? <a href={item.url} target="_blank" rel="noreferrer">{item.headline}</a> : item.headline}
      </div>
      <div className="feed-item-meta">
        <span className="feed-item-src">{item.src}</span>
        <span>{timeAgo(item.date)}</span>
      </div>
    </div>
  );
}

export function CveRow({ item }: { item: Cve }) {
  const sevClass = item.severity?.toLowerCase().includes('crit') ? 'sev-crit'
    : item.severity?.toLowerCase().includes('high') ? 'sev-high' : 'sev-mid';
  return (
    <div className="feed-item">
      <div className="feed-item-headline">
        <span className={`sev-badge ${sevClass}`}>{item.severity ?? 'N/A'}</span> {item.id}
      </div>
      <div className="feed-item-desc">{item.description}</div>
      <div className="feed-item-meta">
        <span>{item.score !== null ? `CVSS ${item.score.toFixed(1)}` : ''}</span>
        <span>{timeAgo(item.published)}</span>
      </div>
    </div>
  );
}

export function ThreatActorRow({ item }: { item: ThreatActor }) {
  const primaryAlias = item.aliases.find(a => a !== item.name);
  return (
    <div className="feed-item">
      <div className="feed-item-headline">
        {item.name}{primaryAlias ? ` (aka ${primaryAlias})` : ''}
      </div>
      <div className="feed-item-meta">
        <span className="feed-item-src">MITRE {item.mitreId}</span>
        <span>Updated {timeAgo(item.modified)}</span>
      </div>
    </div>
  );
}

export function BreachRow({ item }: { item: Breach }) {
  const sevClass = item.sensitive ? 'sev-crit' : item.verified ? 'sev-high' : 'sev-mid';
  return (
    <div className="feed-item">
      <div className="feed-item-headline">
        <span className={`sev-badge ${sevClass}`}>{item.sensitive ? 'SENSITIVE' : item.verified ? 'VERIFIED' : 'UNVERIFIED'}</span>
        {' '}{item.headline}
      </div>
      <div className="feed-item-meta">
        <span className="feed-item-src">{item.src}</span>
        <span>{timeAgo(item.date)}</span>
      </div>
    </div>
  );
}