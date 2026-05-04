import React from 'react';
import { Link } from '../router/AppRouter';
import { RaceCard } from '../races/components/RaceCard';
import { races } from '../domain/racesData';
import { toRace } from '../races/services';

export function HomePage() {
  const sample = races.slice(0, 3).map((r: any) => toRace({ ...r, id: String(r.id), isCancelled: false, createdAt: '', updatedAt: '' }));
  return <div className="fade-in-up">
    <section className="hero-block">
      <div className="page-wrap">
        <p className="badge" style={{ marginBottom: '.8rem' }}>Données de démonstration</p>
        <h1 className="hero-title">Trouvez la course trail qui vous correspond <span style={{ color: '#eb7724' }}>vraiment</span></h1>
        <p className="muted" style={{ maxWidth: 760, margin: '0 auto' }}>Comparez les courses selon la distance, le dénivelé, le terrain, les barrières horaires et votre profil coureur.</p>
        <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', justifyContent: 'center', margin: '1.1rem 0 0' }}>
          <Link to="/courses" className="primary-btn">Trouver ma course</Link>
          <Link to="/comparer" className="secondary-btn">Comparer des courses</Link>
        </div>
      </div>
    </section>

    <section className="page-wrap" style={{ padding: '2.2rem 0' }}>
      <h2 className="section-title" style={{ textAlign: 'center' }}>Comment ça marche ?</h2>
      <p className="muted" style={{ textAlign: 'center' }}>Trois étapes pour trouver la course idéale.</p>
      <div className="grid-cards" style={{ marginTop: '1rem' }}>
        <div className="race-card"><h3>01 • Explorez les courses</h3><p className="muted">Parcourez la base et filtrez par région, distance, D+ et terrain.</p></div>
        <div className="race-card"><h3>02 • Comparez côte à côte</h3><p className="muted">Sélectionnez jusqu’à 4 courses et comparez les critères essentiels.</p></div>
        <div className="race-card"><h3>03 • Vérifiez la compatibilité</h3><p className="muted">Renseignez votre profil pour un score adapté à votre niveau.</p></div>
      </div>
    </section>

    <section className="page-wrap" style={{ paddingBottom: '1rem' }}>
      <h2 className="section-title">Aperçu des courses</h2>
      <div className="grid-cards">{sample.map((race) => <RaceCard key={race.id} race={race} />)}</div>
    </section>

    <section className="page-wrap cta-band">
      <h2 className="section-title" style={{ color: '#fff' }}>Prêt à trouver votre prochaine aventure ?</h2>
      <p className="muted">Explorez les courses, comparez-les et trouvez celle qui vous correspond vraiment.</p>
      <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
        <Link to="/courses" className="primary-btn">Explorer les courses</Link>
        <Link to="/profil" className="secondary-btn" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,.35)', color: '#fff' }}>Créer mon profil coureur</Link>
      </div>
    </section>

    <footer className="page-wrap dark-footer">
      <strong>TrailMatch</strong>
      <p>Comparez les trails selon leur difficulté réelle, pas seulement leur distance.</p>
    </footer>
  </div>;
}
