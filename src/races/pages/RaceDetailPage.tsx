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
  const level = analysis.score < 40 ? 'accessible' : analysis.score < 60 ? 'exigeant' : analysis.score < 80 ? 'très exigeant' : 'ultra exigeant';
  return <div><h1 className="hero-title">{race.name}</h1><p className="muted">{race.location} • {race.region} • {race.date}</p>
    <div className="grid-cards"><div className="race-card"><strong>{race.distanceKm} km</strong></div><div className="race-card"><strong>{race.elevationGainM}m D+</strong></div><div className="race-card"><strong>{race.elevationPerKm.toFixed(1)} m/km</strong></div><div className="race-card"><strong>Temps limite {race.cutoffTimeMinutes} min</strong></div><div className="race-card">Allure min {analysis.paces.cutoffPaceMinKm.toFixed(2)} min/km</div><div className="race-card">Médian {race.medianFinisherTimeMinutes} min</div><div className="race-card">Dernier {race.lastFinisherTimeMinutes} min</div><div className="race-card">Ravitos {race.aidStationsCount}</div></div>
    <h2 className="section-title">Analyse TrailMatch</h2><p>Score difficulté <strong>{analysis.score}/100</strong> • Niveau <strong>{level}</strong></p>
    <ul><li>Point de vigilance: ratio D+/km {race.elevationPerKm.toFixed(1)}</li><li>Point favorable: terrain {race.terrainType}</li></ul>
  </div>;
}
