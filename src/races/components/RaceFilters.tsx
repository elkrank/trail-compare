import React from 'react';

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

export function RaceFilters({ filters, onChange }: { filters: RaceFilterState; onChange: (next: RaceFilterState) => void }) {
  const set = (key: keyof RaceFilterState, value: string) => onChange({ ...filters, [key]: value });
  return <div className="grid gap-2 md:grid-cols-4">
    <input placeholder="Recherche nom / ville / région" value={filters.query} onChange={(e) => set('query', e.target.value)} />
    <input placeholder="Région" value={filters.region} onChange={(e) => set('region', e.target.value)} />
    <input type="month" value={filters.month} onChange={(e) => set('month', e.target.value)} />
    <input placeholder="D+ min" type="number" value={filters.minElevation} onChange={(e) => set('minElevation', e.target.value)} />
    <input placeholder="D+ max" type="number" value={filters.maxElevation} onChange={(e) => set('maxElevation', e.target.value)} />
    <input placeholder="Distance min" type="number" value={filters.minDistance} onChange={(e) => set('minDistance', e.target.value)} />
    <input placeholder="Distance max" type="number" value={filters.maxDistance} onChange={(e) => set('maxDistance', e.target.value)} />
    <input placeholder="Terrain" value={filters.terrain} onChange={(e) => set('terrain', e.target.value)} />
    <input placeholder="Technicité" value={filters.technicality} onChange={(e) => set('technicality', e.target.value)} />
    <select value={filters.sort} onChange={(e) => set('sort', e.target.value)}><option value="date,asc">Date ↑</option><option value="date,desc">Date ↓</option></select>
  </div>;
}
