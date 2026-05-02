import React, { useEffect, useState } from 'react';
import { getRaces } from '../../api/races.service';
import type { RaceDto } from '../../api/types';
import { RaceFilters, type RaceFilterState } from '../components/RaceFilters';
import { RacePagination } from '../components/RacePagination';
import { Link } from '../../router/AppRouter';

const defaultFilters: RaceFilterState = { region: '', terrain: '', minDistance: '', maxDistance: '', minDate: '', maxDate: '', sort: 'date,asc' };

export function RacesListPage() {
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(0);
  const [items, setItems] = useState<RaceDto[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getRaces({
      region: filters.region || undefined,
      terrain: filters.terrain || undefined,
      minDistance: filters.minDistance ? Number(filters.minDistance) : undefined,
      maxDistance: filters.maxDistance ? Number(filters.maxDistance) : undefined,
      minDate: filters.minDate || undefined,
      maxDate: filters.maxDate || undefined,
      page,
      size: 10,
      sort: filters.sort,
    }).then((response) => {
      setItems(response.items);
      setTotal(response.total);
    }).finally(() => setLoading(false));
  }, [filters, page]);

  return <div><h1>Courses</h1><RaceFilters filters={filters} onChange={setFilters} />
    {loading ? <p>Loading...</p> : <ul>{items.map((race) => <li key={race.id}><Link to={`/races/${race.id}`}>{race.name}</Link></li>)}</ul>}
    <RacePagination page={page} total={total} pageSize={10} onPageChange={setPage} />
  </div>;
}
