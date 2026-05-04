import React, { useEffect, useMemo, useState } from 'react';
import { getRaces } from '../api/races.service';
import { computeCompatibilityScore, computeDifficultyScore, loadRunnerProfile, toRace } from '../races/services';

export function ComparatorPage() {
  const [races, setRaces] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  useEffect(() => { getRaces({ size: 30 }).then((r) => setRaces(r.items.map(toRace))); }, []);
  const profile = loadRunnerProfile();
  const selected = useMemo(() => races.filter((r) => selectedIds.includes(r.id)), [races, selectedIds]);
  return <div><h1>Comparateur</h1>{!profile ? <p className="muted">Complétez votre profil pour score de compatibilité.</p> : null}<div className="grid-cards">{races.map((r) => <button key={r.id} type="button" onClick={() => setSelectedIds((p) => p.includes(r.id) ? p.filter((x) => x !== r.id) : [...p, r.id].slice(0, 4))}>{r.name}</button>)}</div><table><thead><tr><th>Course</th><th>Distance</th><th>D+</th><th>Difficulté</th><th>Compatibilité</th></tr></thead><tbody>{selected.map((r) => <tr key={r.id}><td>{r.name}</td><td>{r.distanceKm}</td><td>{r.elevationGainM}</td><td>{computeDifficultyScore(r)}</td><td>{computeCompatibilityScore(r, profile ?? undefined) ?? '-'}</td></tr>)}</tbody></table></div>;
}
