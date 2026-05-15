import React, { useEffect, useMemo, useState } from 'react';
import { getRaces } from '../../api/races.service';
import type { RaceDto } from '../../api/types';
import { RaceFilters, type RaceFilterState } from '../components/RaceFilters';
import { RacePagination } from '../components/RacePagination';
import { ErrorState, EmptyState, LoadingState } from '../../shared/components/AsyncStates';
import { AppApiError, normalizeApiError } from '../../api/errors';
import { toRace } from '../services';
import { RaceCard } from '../components/RaceCard';

const defaultFilters: RaceFilterState = { query: '', region: '', month: '', terrain: '', technicality: '', minDistance: '', maxDistance: '', minElevation: '', maxElevation: '', sort: 'date,asc' };

export function RacesListPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<RaceDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppApiError | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const updateFilters = (next: RaceFilterState) => {
    setFilters(next);
    setPage(0);
  };

  const loadRaces = () => {
    setLoading(true); setError(null);
    getRaces({ region: filters.region || undefined, terrain: filters.terrain || undefined, minDistance: filters.minDistance ? Number(filters.minDistance) : undefined, maxDistance: filters.maxDistance ? Number(filters.maxDistance) : undefined, page, size: 10, sort: filters.sort })
      .then((response) => { setItems(response.items); setTotal(response.total); })
      .catch((err: unknown) => setError(normalizeApiError(err)))
      .finally(() => setLoading(false));
  };
  useEffect(() => { loadRaces(); }, [filters.region, filters.terrain, filters.minDistance, filters.maxDistance, filters.sort, page]);

  const displayed = useMemo(() => items.map(toRace).filter((race) => {
    if (filters.query && !`${race.name} ${race.location} ${race.region}`.toLowerCase().includes(filters.query.toLowerCase())) return false;
    if (filters.month && !race.date.startsWith(filters.month)) return false;
    if (filters.minElevation && race.elevationGainM < Number(filters.minElevation)) return false;
    if (filters.maxElevation && race.elevationGainM > Number(filters.maxElevation)) return false;
    if (filters.technicality && !race.technicalityLevel.includes(filters.technicality.toLowerCase())) return false;
    return true;
  }), [items, filters]);

  return <div className="courses-page fade-in-up">
    <section className="courses-hero" aria-labelledby="courses-hero-title">
      <div className="courses-hero-copy">
        <span className="courses-hero-icon" aria-hidden="true">⛰️</span>
        <p className="courses-eyebrow">TrailMatch courses</p>
        <h1 id="courses-hero-title">Trouvez votre prochaine aventure</h1>
        <p className="courses-hero-subtitle">Comparez les trails selon la distance, le D+, la technicité et les barrières horaires pour choisir un défi adapté à votre profil.</p>
      </div>
    </section>

    <RaceFilters filters={filters} onChange={updateFilters} mode="compact" defaultFilters={defaultFilters} renderSort={false} />

    <div className="courses-toolbar">
      <p><strong>{total}</strong> courses trouvées</p>
      <label>
        <span>Trier par :</span>
        <select value={filters.sort} onChange={(event) => updateFilters({ ...filters, sort: event.target.value })}>
          <option value="date,asc">Date ↑</option>
          <option value="date,desc">Date ↓</option>
        </select>
      </label>
    </div>

    {loading ? <LoadingState /> : null}
    {!loading && error ? <ErrorState error={error} onRetry={loadRaces} /> : null}
    {!loading && !error && displayed.length === 0 ? <EmptyState message="Aucune course trouvée." /> : null}
    {!loading && !error && displayed.length > 0 ? <div className="courses-card-grid">{displayed.map((race) => <RaceCard key={race.id} race={race} onCompare={(id) => setSelectedIds((p) => [...new Set([...p, id])].slice(0, 4))} />)}</div> : null}
    {selectedIds.length > 0 ? <p className="muted courses-compare-summary">{selectedIds.length} course(s) prêtes pour le comparateur.</p> : null}
    <RacePagination page={page} total={total} pageSize={10} onPageChange={setPage} />
  </div>;
}
