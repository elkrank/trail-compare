import React, { useEffect, useState } from 'react';
import { getRaces } from '../../api/races.service';
import type { RaceDto } from '../../api/types';
import { RaceFilters, type RaceFilterState } from '../components/RaceFilters';
import { RacePagination } from '../components/RacePagination';
import { Link } from '../../router/AppRouter';
import { ErrorState, EmptyState, LoadingState } from '../../shared/components/AsyncStates';
import { AppApiError, normalizeApiError } from '../../api/errors';

const defaultFilters: RaceFilterState = { region: '', terrain: '', minDistance: '', maxDistance: '', minDate: '', maxDate: '', sort: 'date,asc' };

export function RacesListPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<RaceDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppApiError | null>(null);

  const loadRaces = () => {
    setLoading(true);
    setError(null);
    getRaces({
      region: filters.region || undefined, terrain: filters.terrain || undefined,
      minDistance: filters.minDistance ? Number(filters.minDistance) : undefined,
      maxDistance: filters.maxDistance ? Number(filters.maxDistance) : undefined,
      minDate: filters.minDate || undefined, maxDate: filters.maxDate || undefined, page, size: 10, sort: filters.sort,
    }).then((response) => {
      setItems(response.items);
      setTotal(response.total);
    }).catch((err: unknown) => {
      setError(normalizeApiError(err));
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadRaces(); }, [filters, page]);

  return <div className="fade-in-up"><h1>Courses</h1><p className="muted">Trouvez votre prochaine aventure trail.</p><RaceFilters filters={filters} onChange={setFilters} />
    {loading ? <LoadingState /> : null}
    {!loading && error ? <ErrorState error={error} onRetry={loadRaces} /> : null}
    {!loading && !error && items.length === 0 ? <EmptyState message="Aucune course trouvée." /> : null}
    {!loading && !error && items.length > 0 ? <div className="grid-cards" style={{ marginTop: '1rem' }}>{items.map((race) => <article className="race-card fade-in-up" key={race.id}><h3>{race.name}</h3>
      <div className="meta-row"><span>{race.distanceKm} km</span><span>•</span><span>{race.date}</span><span>•</span><span>{race.location}</span></div>
      <Link className="cta-link" to={`/races/${race.id}`}>Voir les détails →</Link>
    </article>)}</div> : null}
    <RacePagination page={page} total={total} pageSize={10} onPageChange={setPage} />
  </div>;
}
