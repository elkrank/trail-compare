import React, { useMemo, useState } from 'react';

export interface RaceFilterState {
  query: string;
  region: string;
  month: string;
  minDistance: string;
  maxDistance: string;
  minElevation: string;
  maxElevation: string;
  terrain: string;
  technicality: string;
  sort: string;
}

interface RaceFiltersProps {
  filters: RaceFilterState;
  onChange: (next: RaceFilterState) => void;
  mode?: 'full' | 'compact';
  defaultFilters?: RaceFilterState;
  renderSort?: boolean;
}

const quickActions = [
  { label: '40 km', next: { minDistance: '', maxDistance: '40' } },
  { label: '60 km', next: { minDistance: '40', maxDistance: '60' } },
  { label: 'Montagne', next: { terrain: 'MOUNTAIN' } },
  { label: 'Barrières larges', next: { minDistance: '', maxDistance: '', technicality: 'facile' } },
  { label: 'Technique', next: { technicality: 'technique' } },
] satisfies Array<{ label: string; next: Partial<RaceFilterState> }>;

function formatFilterSummary(filters: RaceFilterState): string {
  const parts = [
    filters.query ? `Recherche “${filters.query}”` : '',
    filters.region ? `Région ${filters.region}` : '',
    filters.month ? `Mois ${filters.month}` : '',
    filters.minDistance ? `≥ ${filters.minDistance} km` : '',
    filters.maxDistance ? `≤ ${filters.maxDistance} km` : '',
    filters.minElevation ? `D+ ≥ ${filters.minElevation} m` : '',
    filters.maxElevation ? `D+ ≤ ${filters.maxElevation} m` : '',
    filters.terrain ? `Terrain ${filters.terrain === 'MOUNTAIN' ? 'montagne' : filters.terrain.toLowerCase()}` : '',
    filters.technicality ? `Technicité ${filters.technicality}` : '',
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(' · ') : 'Aucun filtre actif';
}

export function RaceFilters({ filters, onChange, mode = 'full', defaultFilters, renderSort = true }: RaceFiltersProps) {
  const [advancedOpen, setAdvancedOpen] = useState(mode === 'full');
  const summary = useMemo(() => formatFilterSummary(filters), [filters]);
  const set = (key: keyof RaceFilterState, value: string) => onChange({ ...filters, [key]: value });
  const applyQuickAction = (next: Partial<RaceFilterState>) => onChange({ ...filters, ...next });
  const reset = () => onChange(defaultFilters ?? { ...filters, query: '', region: '', month: '', terrain: '', technicality: '', minDistance: '', maxDistance: '', minElevation: '', maxElevation: '' });

  const fields = <div className="grid gap-2 md:grid-cols-4 courses-advanced-filters">
    <input placeholder="Recherche nom / ville / région" value={filters.query} onChange={(e) => set('query', e.target.value)} />
    <input placeholder="Région" value={filters.region} onChange={(e) => set('region', e.target.value)} />
    <input type="month" value={filters.month} onChange={(e) => set('month', e.target.value)} />
    <input placeholder="D+ min" type="number" value={filters.minElevation} onChange={(e) => set('minElevation', e.target.value)} />
    <input placeholder="D+ max" type="number" value={filters.maxElevation} onChange={(e) => set('maxElevation', e.target.value)} />
    <input placeholder="Distance min" type="number" value={filters.minDistance} onChange={(e) => set('minDistance', e.target.value)} />
    <input placeholder="Distance max" type="number" value={filters.maxDistance} onChange={(e) => set('maxDistance', e.target.value)} />
    <input placeholder="Terrain" value={filters.terrain} onChange={(e) => set('terrain', e.target.value)} />
    <input placeholder="Technicité" value={filters.technicality} onChange={(e) => set('technicality', e.target.value)} />
    {renderSort ? <select value={filters.sort} onChange={(e) => set('sort', e.target.value)}><option value="date,asc">Date ↑</option><option value="date,desc">Date ↓</option></select> : null}
  </div>;

  if (mode === 'compact') {
    return <>
      <div className="courses-quick-filters" aria-label="Filtres rapides">
        {quickActions.map((action) => <button key={action.label} type="button" className="quick-filter-chip" onClick={() => applyQuickAction(action.next)}>{action.label}</button>)}
        <button type="button" className="quick-filter-chip quick-filter-chip--add" onClick={() => setAdvancedOpen((open) => !open)} aria-expanded={advancedOpen}>+</button>
      </div>
      <div className="courses-filter-bar">
        <button type="button" className="advanced-filter-button" onClick={() => setAdvancedOpen((open) => !open)} aria-expanded={advancedOpen}>Filtres avancés</button>
        <span className="active-filter-summary">{summary}</span>
        <button type="button" className="reset-filter-button" onClick={reset}>Réinitialiser</button>
      </div>
      {advancedOpen ? fields : null}
    </>;
  }

  return fields;
}
