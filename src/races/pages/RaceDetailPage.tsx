import React, { useEffect, useMemo, useState } from 'react';
import { getRaceById } from '../../api/races.service';
import { AppApiError, normalizeApiError } from '../../api/errors';
import { EmptyState, ErrorState, LoadingState } from '../../shared/components/AsyncStates';
import { computeDifficultyScore, computePaces, toRace } from '../services';

export function RaceDetailPage({ id }: { id: string }) {
  const [race, setRace] = useState<ReturnType<typeof toRace> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppApiError | null>(null);
  const loadRace = () => { setLoading(true); setError(null); getRaceById(id).then((dto) => setRace(toRace(dto))).catch((e: unknown) => setError(normalizeApiError(e))).finally(() => setLoading(false)); };
  useEffect(() => { loadRace(); }, [id]);
  const analysis = useMemo(() => race ? { score: computeDifficultyScore(race), paces: computePaces(race) } : null, [race]);
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={loadRace} showBackToList={error.code === 'NOT_FOUND'} />;
  if (!race || !analysis) return <EmptyState message="Aucune donnée disponible pour cette course." />;
  return <div><h1>{race.name}</h1><p>{race.location} • {race.region} • {race.date}</p>
    <p>{race.distanceKm} km • {race.elevationGainM}m D+ • {race.elevationPerKm.toFixed(1)} m/km</p>
    <p>{race.terrainType} • {race.technicalityLevel} • Temps limite {race.cutoffTimeMinutes} min ({analysis.paces.cutoffPaceMinKm.toFixed(2)} min/km)</p>
    <p>Dernier finisher: {race.lastFinisherTimeMinutes} min • Médian: {race.medianFinisherTimeMinutes} min • Ravitos: {race.aidStationsCount}</p>
    <p>{race.description}</p>
    <h2>Analyse TrailMatch</h2><p>Score difficulté: {analysis.score}/100</p>
    <p>Niveau estimé: {analysis.score < 40 ? 'accessible' : analysis.score < 60 ? 'exigeant' : analysis.score < 80 ? 'très exigeant' : 'ultra exigeant'}</p>
  </div>;
}
