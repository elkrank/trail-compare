import React, { useEffect, useMemo, useState } from 'react';
import { getRaces } from '../api/races.service';
import { computeCompatibilityScore, computeDifficultyScore, loadRunnerProfile, toRace } from '../races/services';

export function ComparatorPage() {
  const [races, setRaces] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  useEffect(() => { getRaces({ size: 30 }).then((r) => setRaces(r.items.map(toRace))); }, []);
  const profile = loadRunnerProfile();
  const selected = useMemo(() => races.filter((r) => selectedIds.includes(r.id)), [races, selectedIds]);
  const summary = selected.length ? {
    accessible: [...selected].sort((a, b) => computeDifficultyScore(a) - computeDifficultyScore(b))[0]?.name,
    difficult: [...selected].sort((a, b) => computeDifficultyScore(b) - computeDifficultyScore(a))[0]?.name,
  } : null;
  return <div><h1 className="hero-title">Comparer les courses</h1>
    {!profile ? <p className="muted">Complétez votre profil pour le score de compatibilité.</p> : null}
    {summary ? <p className="muted">Plus accessible : {summary.accessible} • Plus difficile : {summary.difficult}</p> : null}
    <div className="grid-cards">{races.map((r) => <button key={r.id} type="button" onClick={() => setSelectedIds((p) => p.includes(r.id) ? p.filter((x) => x !== r.id) : [...p, r.id].slice(0, 4))}>{selectedIds.includes(r.id) ? 'Retirer' : 'Ajouter'} — {r.name}</button>)}</div>
    <div className="table-wrap"><table><thead><tr><th>Course</th><th>Distance</th><th>D+</th><th>D+/km</th><th>Terrain</th><th>Technicité</th><th>Limite</th><th>Médian</th><th>Dernier</th><th>Ravitos</th><th>Prix</th><th>Difficulté</th><th>Compat.</th></tr></thead><tbody>{selected.map((r) => <tr key={r.id}><td>{r.name}</td><td>{r.distanceKm}</td><td>{r.elevationGainM}</td><td>{r.elevationPerKm.toFixed(1)}</td><td>{r.terrainType}</td><td>{r.technicalityLevel}</td><td>{r.cutoffTimeMinutes}</td><td>{r.medianFinisherTimeMinutes}</td><td>{r.lastFinisherTimeMinutes}</td><td>{r.aidStationsCount}</td><td>{r.priceEur}€</td><td>{computeDifficultyScore(r)}</td><td>{computeCompatibilityScore(r, profile ?? undefined) ?? '-'}</td></tr>)}</tbody></table></div>
  </div>;
}
