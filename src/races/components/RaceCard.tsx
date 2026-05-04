import React from 'react';
import { Link } from '../../router/AppRouter';
import type { Race } from '../types';
import { computeDifficultyScore } from '../services';

export function RaceCard({ race, onCompare }: { race: Race; onCompare?: (id: string) => void }) {
  const score = computeDifficultyScore(race);
  return <article className="race-card fade-in-up">
    <h3>{race.name}</h3>
    <div className="meta-row"><strong style={{ fontSize: '1.5rem' }}>{race.distanceKm} km</strong><span>{race.elevationGainM} m D+</span><span>{race.elevationPerKm.toFixed(1)} m/km</span></div>
    <div className="meta-row"><span>{race.location}</span><span>{race.region}</span><span>{race.date}</span></div>
    <div className="meta-row"><span className="badge">{race.terrainType}</span><span className="badge">{race.technicalityLevel}</span><span className="badge">Limite {race.cutoffTimeMinutes} min</span><span className="badge">Difficulté {score}/100</span></div>
    <div className="meta-row">{race.tags.map((tag) => <span className="badge" key={tag}>#{tag}</span>)}</div>
    <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
      <Link className="secondary-btn" to={`/courses/${race.id}`}>Voir le détail</Link>
      {onCompare ? <button type="button" onClick={() => onCompare(race.id)}>Comparer</button> : null}
    </div>
  </article>;
}
