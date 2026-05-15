import React, { useEffect, useMemo, useState } from 'react';
import { Link } from '../../router/AppRouter';
import { getRaceGpx } from '../../api/races.service';
import type { Race } from '../types';
import { computeDifficultyScore } from '../services';
import { buildElevationProfilePath, parseGpxElevationProfile, type ElevationProfilePoint } from '../gpx';

function formatRaceDate(date: string): string {
  if (!date) return 'Date à confirmer';
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(parsed);
}

function fallbackProfilePath(distanceKm: number, elevationGainM: number): string {
  const distance = Math.max(distanceKm || 0, 1);
  const elevation = Math.max(elevationGainM || 0, 0);
  const peak = Math.min(46, 10 + (elevation / Math.max(distance, 1)) * 0.28);
  const middle = Math.max(12, peak * 0.55);
  return `M4 54 C18 ${54 - middle}, 28 ${56 - peak}, 42 ${54 - peak} S70 ${42 - middle}, 92 18`;
}

function AltitudeProfile({
  distanceKm,
  elevationGainM,
  profilePoints,
}: {
  distanceKm: number;
  elevationGainM: number;
  profilePoints?: ElevationProfilePoint[];
}) {
  const gpxPath = useMemo(() => profilePoints ? buildElevationProfilePath(profilePoints) : null, [profilePoints]);
  const path = gpxPath ?? fallbackProfilePath(distanceKm, elevationGainM);
  const sourceLabel = gpxPath ? 'depuis le GPX' : 'estimé';

  return <svg className="race-altitude-profile" viewBox="0 0 96 60" role="img" aria-label={`Mini profil d'altitude ${sourceLabel}`} focusable="false">
    <path className="race-altitude-fill" d={`${path} L92 56 L4 56 Z`} />
    <path className="race-altitude-line" d={path} />
    {gpxPath ? <text className="race-altitude-source" x="6" y="12">GPX</text> : null}
  </svg>;
}

export function RaceCard({ race, onCompare }: { race: Race; onCompare?: (id: string) => void }) {
  const score = computeDifficultyScore(race);
  const distanceKm = race.distanceKm || 0;
  const elevationGainM = race.elevationGainM || 0;
  const cutoffTimeMinutes = race.cutoffTimeMinutes || 0;
  const safeTags = race.tags ?? [];
  const elevationPerKm = Number.isFinite(race.elevationPerKm) ? race.elevationPerKm : elevationGainM / Math.max(distanceKm, 1);
  const [gpxProfile, setGpxProfile] = useState<ElevationProfilePoint[] | undefined>();

  useEffect(() => {
    const gpxUrl = race.gpxUrl ?? race.gpxFileUrl;
    const shouldLoadGpx = Boolean(gpxUrl || race.hasGpx);
    let isMounted = true;

    setGpxProfile(undefined);
    if (!shouldLoadGpx) return undefined;

    getRaceGpx(race.id, gpxUrl)
      .then((gpxXml) => {
        if (!isMounted || !gpxXml) return;
        const profile = parseGpxElevationProfile(gpxXml);
        if (profile.length > 1) setGpxProfile(profile);
      });

    return () => { isMounted = false; };
  }, [race.gpxFileUrl, race.gpxUrl, race.hasGpx, race.id]);

  return <article className="race-card fade-in-up">
    <div className="race-card-topline">
      <span className="status-badge">À venir</span>
      <div className="difficulty-score" aria-label={`Difficulté ${score} sur 100`}>
        <strong>{score}</strong><span>/100</span><small>Difficulté</small>
      </div>
    </div>
    <h3>{race.name || 'Course à confirmer'}</h3>
    <AltitudeProfile distanceKm={distanceKm} elevationGainM={elevationGainM} profilePoints={gpxProfile} />
    <div className="race-card-metrics" aria-label="Métriques principales">
      <div><strong>{distanceKm}</strong><span>km</span></div>
      <div><strong>{elevationGainM}</strong><span>m D+</span></div>
      <div><strong>{elevationPerKm.toFixed(1)}</strong><span>m/km</span></div>
    </div>
    <div className="race-card-badges">
      <span className="badge">{race.terrainType}</span>
      <span className="badge">{race.technicalityLevel}</span>
      <span className="badge">Limite {cutoffTimeMinutes} min</span>
    </div>
    {safeTags.length > 0 ? <div className="race-card-badges race-card-tags">{safeTags.slice(0, 3).map((tag) => <span className="badge" key={tag}>#{tag}</span>)}</div> : null}
    <div className="race-card-meta">
      <span title={[race.location, race.region].filter(Boolean).join(', ')}>📍 {[race.location, race.region].filter(Boolean).join(', ') || 'Lieu à confirmer'}</span>
      <span>📅 {formatRaceDate(race.date)}</span>
    </div>
    <div className="race-card-actions">
      <Link className="secondary-btn race-detail-link" to={`/courses/${race.id}`}>Voir le détail</Link>
      {onCompare ? <button className="primary-btn race-compare-button" type="button" onClick={() => onCompare(race.id)}>Comparer</button> : null}
    </div>
  </article>;
}
