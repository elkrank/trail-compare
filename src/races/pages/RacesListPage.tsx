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

  return <div className="fade-in-up"><h1>Courses TrailMatch</h1><p className="muted">Comparez selon distance, D+, technicité et barrières horaires.</p><RaceFilters filters={filters} onChange={setFilters} />
    {loading ? <LoadingState /> : null}
    {!loading && error ? <ErrorState error={error} onRetry={loadRaces} /> : null}
    {!loading && !error && displayed.length === 0 ? <EmptyState message="Aucune course trouvée." /> : null}
    {!loading && !error && displayed.length > 0 ? <div className="grid-cards" style={{ marginTop: '1rem' }}>{displayed.map((race) => <RaceCard key={race.id} race={race} onCompare={(id) => setSelectedIds((p) => [...new Set([...p, id])].slice(0, 4))} />)}</div> : null}
    {selectedIds.length > 0 ? <p className="muted">{selectedIds.length} course(s) prêtes pour le comparateur.</p> : null}
    <RacePagination page={page} total={total} pageSize={10} onPageChange={setPage} />
  </div>;
}
