import React from 'react';

export interface RaceFilterState {
  region: string;
  terrain: string;
  minDistance: string;
  maxDistance: string;
  minDate: string;
  maxDate: string;
  sort: string;
}

export function RaceFilters({ filters, onChange }: { filters: RaceFilterState; onChange: (next: RaceFilterState) => void }) {
  const set = (key: keyof RaceFilterState, value: string) => onChange({ ...filters, [key]: value });
  return <div className="grid gap-2 md:grid-cols-4">
    <input placeholder="region" value={filters.region} onChange={(e) => set('region', e.target.value)} />
    <input placeholder="terrain" value={filters.terrain} onChange={(e) => set('terrain', e.target.value)} />
    <input placeholder="minDistance" type="number" value={filters.minDistance} onChange={(e) => set('minDistance', e.target.value)} />
    <input placeholder="maxDistance" type="number" value={filters.maxDistance} onChange={(e) => set('maxDistance', e.target.value)} />
    <input placeholder="minDate" type="date" value={filters.minDate} onChange={(e) => set('minDate', e.target.value)} />
    <input placeholder="maxDate" type="date" value={filters.maxDate} onChange={(e) => set('maxDate', e.target.value)} />
    <select value={filters.sort} onChange={(e) => set('sort', e.target.value)}>
      <option value="date,asc">date asc</option><option value="date,desc">date desc</option>
    </select>
  </div>;
}
