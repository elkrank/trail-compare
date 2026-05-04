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
  return <div><h1 className="hero-title">Profil coureur</h1>
    <div className="grid-cards">
      <input aria-label="distance max" type="number" value={profile.maxDistanceKm} onChange={(e) => set('maxDistanceKm', Number(e.target.value))} placeholder="Distance max déjà réalisée" />
      <input aria-label="dplus max" type="number" value={profile.maxElevationGainM} onChange={(e) => set('maxElevationGainM', Number(e.target.value))} placeholder="D+ max déjà réalisé" />
      <input type="number" value={profile.weeklyVolumeKm} onChange={(e) => set('weeklyVolumeKm', Number(e.target.value))} placeholder="Volume hebdo (km)" />
      <input type="number" value={profile.weeklyTrainingHours} onChange={(e) => set('weeklyTrainingHours', Number(e.target.value))} placeholder="Temps dispo / semaine" />
      <input type="number" value={profile.longestRecentRunKm} onChange={(e) => set('longestRecentRunKm', Number(e.target.value))} placeholder="Plus longue sortie récente" />
      <select value={profile.usualTerrain} onChange={(e) => set('usualTerrain', e.target.value)}><option value="mixte">mixte</option><option value="sentier">sentier</option><option value="montagne">montagne</option><option value="route">route</option></select>
      <select value={profile.currentFitnessLevel} onChange={(e) => set('currentFitnessLevel', e.target.value)}><option value="debutant">débutant</option><option value="intermediaire">intermédiaire</option><option value="avance">avancé</option></select>
      <select value={profile.objective} onChange={(e) => set('objective', e.target.value)}><option value="finir">finir</option><option value="progresser">progresser</option><option value="performance">performance</option><option value="reprise">reprise</option><option value="ultra">ultra</option></select>
      <input type="date" value={profile.targetDate ?? ''} onChange={(e) => set('targetDate', e.target.value)} />
      <input type="number" step="0.1" value={profile.averageEasyPaceMinKm ?? ''} onChange={(e) => set('averageEasyPaceMinKm', Number(e.target.value))} placeholder="Allure endurance (optionnel)" />
      <input type="number" step="0.1" value={profile.averageTrailPaceMinKm ?? ''} onChange={(e) => set('averageTrailPaceMinKm', Number(e.target.value))} placeholder="Allure trail (optionnel)" />
    </div>
    <div style={{ marginTop: '.8rem', display: 'flex', gap: '.6rem', alignItems: 'center', flexWrap: 'wrap' }}><button type="button" className="primary-btn" disabled={invalid} onClick={() => { saveRunnerProfile(profile); setSaved(true); }}>Sauvegarder</button><Link to="/comparer" className="secondary-btn">Aller au comparateur</Link></div>
    {invalid ? <p className="muted">Profil incomplet</p> : null}{saved ? <div className="race-card"><strong>Résumé</strong><p>{profile.maxDistanceKm} km max • {profile.maxElevationGainM}m D+ max • {profile.currentFitnessLevel}</p></div> : null}
  </div>;
}
