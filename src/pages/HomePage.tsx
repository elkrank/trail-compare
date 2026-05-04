import React from 'react';
import { Link } from '../router/AppRouter';
import { RaceCard } from '../races/components/RaceCard';
import { races } from '../domain/racesData';
import { toRace } from '../races/services';

export function HomePage() {
  const sample = races.slice(0, 3).map((r: any) => toRace({ ...r, id: String(r.id), isCancelled: false, createdAt: '', updatedAt: '' }));
  return <div className="fade-in-up">
    <p className="muted">Comparateur intelligent trail/running</p>
    <h1 className="hero-title">Trouvez la course de trail faite pour votre niveau réel</h1>
    <p className="muted">TrailMatch compare distance, dénivelé, technicité, barrières horaires et profil coureur pour vous aider à choisir le bon défi.</p>
    <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', margin: '1rem 0 1.2rem' }}>
      <Link to="/courses" className="primary-btn">Explorer les courses</Link>
      <Link to="/profil" className="secondary-btn">Créer mon profil</Link>
    </div>
    <div className="grid-cards"><div className="race-card">Analyse de difficulté</div><div className="race-card">Compatibilité profil</div><div className="race-card">Comparaison côte à côte</div><div className="race-card">Barrières horaires</div></div>
    <h2 className="section-title" style={{ marginTop: '1.2rem' }}>Comment ça marche ?</h2>
    <ol><li>Je renseigne mon profil</li><li>Je sélectionne des courses</li><li>TrailMatch estime la compatibilité</li></ol>
    <h2 className="section-title">Aperçu des courses</h2>
    <div className="grid-cards">{sample.map((race) => <RaceCard key={race.id} race={race} />)}</div>
  </div>;
}
