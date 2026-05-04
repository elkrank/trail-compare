import React, { useState } from 'react';
import { Link } from '../router/AppRouter';
import { loadRunnerProfile, saveRunnerProfile } from '../races/services';
import type { RunnerProfile } from '../races/types';

const base: RunnerProfile = { maxDistanceKm: 0, maxElevationGainM: 0, weeklyVolumeKm: 0, weeklyTrainingHours: 0, longestRecentRunKm: 0, currentFitnessLevel: 'debutant', usualTerrain: 'mixte', objective: 'finir' };

export function RunnerProfilePage() {
  const [profile, setProfile] = useState<RunnerProfile>(loadRunnerProfile() ?? base);
  const [saved, setSaved] = useState(false);
  const invalid = profile.maxDistanceKm <= 0 || profile.maxElevationGainM <= 0;
  const set = (k: keyof RunnerProfile, v: any) => setProfile({ ...profile, [k]: v });

  return <div className="fade-in-up">
    <section className="hero-block">
      <div className="page-wrap">
        <p className="badge" style={{ marginBottom: '.8rem' }}>Profil coureur</p>
        <h1 className="hero-title">Construisez votre profil trail <span style={{ color: '#eb7724' }}>réel</span></h1>
        <p className="muted" style={{ maxWidth: 760, margin: '0 auto' }}>Renseignez vos capacités actuelles pour obtenir des scores de compatibilité plus fiables sur chaque course.</p>
      </div>
    </section>

    <section className="page-wrap" style={{ padding: '2rem 0 1rem' }}>
      <h2 className="section-title">Mes capacités actuelles</h2>
      <div className="grid-cards">
        <input aria-label="distance max" type="number" value={profile.maxDistanceKm} onChange={(e) => set('maxDistanceKm', Number(e.target.value))} placeholder="Distance max déjà réalisée (km)" />
        <input aria-label="dplus max" type="number" value={profile.maxElevationGainM} onChange={(e) => set('maxElevationGainM', Number(e.target.value))} placeholder="D+ max déjà réalisé (m)" />
        <input type="number" value={profile.weeklyVolumeKm} onChange={(e) => set('weeklyVolumeKm', Number(e.target.value))} placeholder="Volume hebdo actuel (km)" />
        <input type="number" value={profile.weeklyTrainingHours} onChange={(e) => set('weeklyTrainingHours', Number(e.target.value))} placeholder="Temps disponible par semaine (h)" />
        <input type="number" value={profile.longestRecentRunKm} onChange={(e) => set('longestRecentRunKm', Number(e.target.value))} placeholder="Plus longue sortie récente (km)" />
        <select value={profile.usualTerrain} onChange={(e) => set('usualTerrain', e.target.value)}><option value="mixte">Terrain habituel: mixte</option><option value="sentier">Terrain habituel: sentier</option><option value="montagne">Terrain habituel: montagne</option><option value="route">Terrain habituel: route</option></select>
      </div>
    </section>

    <section className="page-wrap" style={{ paddingBottom: '1rem' }}>
      <h2 className="section-title">Niveau et objectif</h2>
      <div className="grid-cards">
        <select value={profile.currentFitnessLevel} onChange={(e) => set('currentFitnessLevel', e.target.value)}><option value="debutant">Niveau actuel: débutant</option><option value="intermediaire">Niveau actuel: intermédiaire</option><option value="avance">Niveau actuel: avancé</option></select>
        <select value={profile.objective} onChange={(e) => set('objective', e.target.value)}><option value="finir">Objectif: finir</option><option value="progresser">Objectif: progresser</option><option value="performance">Objectif: performance</option><option value="reprise">Objectif: reprise</option><option value="ultra">Objectif: ultra</option></select>
        <input type="date" value={profile.targetDate ?? ''} onChange={(e) => set('targetDate', e.target.value)} />
        <input type="number" step="0.1" value={profile.averageEasyPaceMinKm ?? ''} onChange={(e) => set('averageEasyPaceMinKm', Number(e.target.value))} placeholder="Allure endurance (min/km, optionnel)" />
        <input type="number" step="0.1" value={profile.averageTrailPaceMinKm ?? ''} onChange={(e) => set('averageTrailPaceMinKm', Number(e.target.value))} placeholder="Allure trail (min/km, optionnel)" />
      </div>
      <div style={{ marginTop: '.9rem', display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" className="primary-btn" disabled={invalid} onClick={() => { saveRunnerProfile(profile); setSaved(true); }}>Sauvegarder mon profil</button>
        <Link to="/comparer" className="secondary-btn">Comparer des courses</Link>
      </div>
      {invalid ? <p className="muted">Profil incomplet : renseignez au minimum distance max et D+ max.</p> : null}
      {saved ? <div className="race-card" style={{ marginTop: '.8rem' }}><strong>Résumé enregistré</strong><p className="muted">{profile.maxDistanceKm} km max • {profile.maxElevationGainM} m D+ max • {profile.currentFitnessLevel}</p></div> : null}
    </section>

    <section className="page-wrap cta-band">
      <h2 className="section-title" style={{ color: '#fff' }}>Prêt à trouver votre prochaine aventure ?</h2>
      <p className="muted">Explorez les courses, comparez-les et trouvez celle qui vous correspond vraiment.</p>
      <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap' }}>
        <Link to="/courses" className="primary-btn">Explorer les courses</Link>
        <Link to="/comparer" className="secondary-btn" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,.35)', color: '#fff' }}>Comparer des courses</Link>
      </div>
    </section>

    <footer className="page-wrap dark-footer">
      <strong>TrailMatch</strong>
      <p>Comparez les trails selon leur difficulté réelle, pas seulement leur distance.</p>
    </footer>
  </div>;
}
