import React, { useEffect, useMemo, useState } from 'react';
import { getRaceById, getRaceElevationProfile } from '../../api/races.service';
import { AppApiError, normalizeApiError } from '../../api/errors';
import { EmptyState, ErrorState, LoadingState } from '../../shared/components/AsyncStates';
import { computeDifficultyScore, computePaces, toRace } from '../services';
import { buildElevationProfilePath, type ElevationProfilePoint } from '../gpx';

function fallbackProfilePath(distanceKm: number, elevationGainM: number): string {
  const distance = Math.max(distanceKm || 0, 1);
  const elevation = Math.max(elevationGainM || 0, 0);
  const peak = Math.min(46, 10 + (elevation / Math.max(distance, 1)) * 0.28);
  const middle = Math.max(12, peak * 0.55);
  return `M4 54 C18 ${54 - middle}, 28 ${56 - peak}, 42 ${54 - peak} S70 ${42 - middle}, 92 18`;
}

function RaceElevationProfile({
  distanceKm,
  elevationGainM,
  profilePoints,
}: {
  distanceKm: number;
  elevationGainM: number;
  profilePoints: ElevationProfilePoint[] | null;
}) {
  const profilePath = useMemo(() => profilePoints ? buildElevationProfilePath(profilePoints) : null, [profilePoints]);
  const path = profilePath ?? fallbackProfilePath(distanceKm, elevationGainM);

  return <section className="race-detail-elevation" aria-labelledby="race-detail-elevation-title">
    <div className="race-detail-section-heading">
      <h2 className="section-title" id="race-detail-elevation-title">Courbe de dénivelé</h2>
      <span>{profilePath ? 'Profil GPX' : 'Profil estimé'}</span>
    </div>
    <svg
      className="race-detail-elevation-chart"
      viewBox="0 0 96 60"
      role="img"
      aria-label={profilePath ? 'Profil d altitude GPX de la course' : 'Profil d altitude estimé'}
      focusable="false"
    >
      <path className="race-altitude-fill" d={`${path} L92 56 L4 56 Z`} />
      <path className="race-altitude-line" d={path} />
    </svg>
    {!profilePath ? <p className="muted race-detail-elevation-fallback">Profil GPX indisponible pour cette course.</p> : null}
  </section>;
}

export function RaceDetailPage({ id }: { id: string }) {
  const [race, setRace] = useState<ReturnType<typeof toRace> | null>(null);
  const [elevationProfile, setElevationProfile] = useState<ElevationProfilePoint[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AppApiError | null>(null);

  const loadRace = () => {
    setLoading(true);
    setError(null);
    setElevationProfile(null);
    getRaceById(id)
      .then((dto) => {
        const nextRace = toRace(dto);
        setRace(nextRace);
        if (!nextRace.hasGpx) return null;
        return getRaceElevationProfile(nextRace.id);
      })
      .then((profile) => {
        const points = profile?.points.map((point) => ({
          distanceKm: point.distanceKm,
          elevationM: point.elevationM,
        })) ?? [];
        setElevationProfile(points.length > 1 ? points : null);
      })
      .catch((e: unknown) => setError(normalizeApiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRace(); }, [id]);

  const analysis = useMemo(() => race ? { score: computeDifficultyScore(race), paces: computePaces(race) } : null, [race]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={loadRace} showBackToList={error.code === 'NOT_FOUND'} />;
  if (!race || !analysis) return <EmptyState message="Aucune donnée disponible pour cette course." />;

  const level = analysis.score < 40 ? 'accessible' : analysis.score < 60 ? 'exigeant' : analysis.score < 80 ? 'très exigeant' : 'ultra exigeant';

  return <div>
    <h1 className="hero-title">{race.name}</h1>
    <p className="muted">{race.location} • {race.region} • {race.date}</p>
    <div className="grid-cards">
      <div className="race-card"><strong>{race.distanceKm} km</strong></div>
      <div className="race-card"><strong>{race.elevationGainM}m D+</strong></div>
      <div className="race-card"><strong>{race.elevationPerKm.toFixed(1)} m/km</strong></div>
      <div className="race-card"><strong>Temps limite {race.cutoffTimeMinutes} min</strong></div>
      <div className="race-card">Allure min {analysis.paces.cutoffPaceMinKm.toFixed(2)} min/km</div>
      <div className="race-card">Médian {race.medianFinisherTimeMinutes} min</div>
      <div className="race-card">Dernier {race.lastFinisherTimeMinutes} min</div>
      <div className="race-card">Ravitos {race.aidStationsCount}</div>
    </div>
    <RaceElevationProfile distanceKm={race.distanceKm} elevationGainM={race.elevationGainM} profilePoints={elevationProfile} />
    <h2 className="section-title">Analyse TrailMatch</h2>
    <p>Score difficulté <strong>{analysis.score}/100</strong> • Niveau <strong>{level}</strong></p>
    <ul>
      <li>Point de vigilance: ratio D+/km {race.elevationPerKm.toFixed(1)}</li>
      <li>Point favorable: terrain {race.terrainType}</li>
    </ul>
  </div>;
}
