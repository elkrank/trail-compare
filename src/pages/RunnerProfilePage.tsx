import React, { useState } from 'react';
import { Link } from '../router/AppRouter';
import { loadRunnerProfile, saveRunnerProfile } from '../races/services';
import type { RunnerProfile } from '../races/types';

const base: RunnerProfile = { maxDistanceKm: 0, maxElevationGainM: 0, weeklyVolumeKm: 0, weeklyTrainingHours: 0, longestRecentRunKm: 0, currentFitnessLevel: 'debutant', usualTerrain: 'mixte', objective: 'finir' };

export function RunnerProfilePage() {
  const [profile, setProfile] = useState<RunnerProfile>(loadRunnerProfile() ?? base);
  const [saved, setSaved] = useState(false);
  const invalid = profile.maxDistanceKm <= 0 || profile.maxElevationGainM <= 0;
  return <div><h1>Profil coureur</h1><div className="grid gap-2 md:grid-cols-3"><input type="number" value={profile.maxDistanceKm} onChange={(e) => setProfile({ ...profile, maxDistanceKm: Number(e.target.value) })} placeholder="Distance max" /><input type="number" value={profile.maxElevationGainM} onChange={(e) => setProfile({ ...profile, maxElevationGainM: Number(e.target.value) })} placeholder="D+ max" /><input type="number" value={profile.weeklyVolumeKm} onChange={(e) => setProfile({ ...profile, weeklyVolumeKm: Number(e.target.value) })} placeholder="Volume hebdo km" /></div><button type="button" disabled={invalid} onClick={() => { saveRunnerProfile(profile); setSaved(true); }}>Sauvegarder</button>{invalid ? <p className="muted">Profil incomplet</p> : null}{saved ? <p>Profil enregistré</p> : null}<Link to="/comparer" className="cta-link">Comparer avec des courses</Link></div>;
}
