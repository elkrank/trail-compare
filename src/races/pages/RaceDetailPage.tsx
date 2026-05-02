import React, { useEffect, useState } from 'react';
import { getRaceById } from '../../api/races.service';
import type { RaceDto } from '../../api/types';
import { AppApiError, normalizeApiError } from '../../api/errors';
import { EmptyState, ErrorState, LoadingState } from '../../shared/components/AsyncStates';

export function RaceDetailPage({ id }: { id: string }) {
  const [race, setRace] = useState<RaceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppApiError | null>(null);

  const loadRace = () => {
    setLoading(true);
    setError(null);
    getRaceById(id)
      .then(setRace)
      .catch((e: unknown) => setError(normalizeApiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRace();
  }, [id]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={loadRace} showBackToList={error.code === 'NOT_FOUND'} />;
  if (!race) return <EmptyState message="Aucune donnée disponible pour cette course." />;
  return <div><h1>{race.name}</h1><p>{race.location}</p></div>;
}
