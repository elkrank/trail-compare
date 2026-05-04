import React from 'react';
import { Link } from '../../router/AppRouter';
import type { Race } from '../types';

export function RaceCard({ race, onCompare }: { race: Race; onCompare?: (id: string) => void }) {
  return <article className="race-card fade-in-up">
    <h3>{race.name}</h3>
    <div className="meta-row"><span>{race.location}</span><span>•</span><span>{race.region}</span><span>•</span><span>{race.date}</span></div>
    <div className="meta-row"><span>{race.distanceKm} km</span><span>{race.elevationGainM} m D+</span><span>{race.elevationPerKm.toFixed(1)} m/km</span></div>
    <div className="meta-row"><span>{race.terrainType}</span><span>{race.technicalityLevel}</span><span>BH: {race.cutoffTimeMinutes} min</span></div>
    <div className="meta-row">{race.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
    <div className="admin-actions">
      <Link className="cta-link" to={`/courses/${race.id}`}>Voir le détail</Link>
      {onCompare ? <button type="button" onClick={() => onCompare(race.id)}>Ajouter au comparateur</button> : null}
    </div>
  </article>;
}
