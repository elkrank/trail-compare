import React, { useEffect, useState } from 'react';
import { getRaceById } from '../../api/races.service';
import type { RaceDto } from '../../api/types';

export function RaceDetailPage({ id }: { id: string }) {
  const [race, setRace] = useState<RaceDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    getRaceById(id)
      .then(setRace)
      .catch((e: any) => {
        if (e?.status === 404) setNotFound(true);
        else setError(e?.message ?? 'Unknown error');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (notFound) return <p>404 - course introuvable.</p>;
  if (error) return <p>Erreur: {error}</p>;
  if (!race) return <p>Aucune donnée.</p>;
  return <div><h1>{race.name}</h1><p>{race.location}</p></div>;
}
