export type Tab = 'overview' | 'darkweb' | 'threatactors' | 'worldnews';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'OVERVIEW' },
  { key: 'darkweb', label: 'DARK WEB' },
  { key: 'threatactors', label: 'THREAT ACTORS' },
  { key: 'worldnews', label: 'WORLD NEWS' },
];

interface TabBarProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

export default function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div className="tab-bar">
      {TABS.map(t => (
        <button
          key={t.key}
          className={`tab-btn ${active === t.key ? 'active' : ''}`}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}