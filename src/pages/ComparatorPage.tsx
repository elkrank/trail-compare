import React, { useEffect, useMemo, useState } from 'react';
import { getRaces } from '../api/races.service';
import { Link } from '../router/AppRouter';
import { computeCompatibilityScore, computeDifficultyScore, loadRunnerProfile, toRace } from '../races/services';
import type { Race, RunnerProfile } from '../races/types';

const MAX_SELECTED_RACES = 3;

type ComparisonMetric = {
  label: string;
  render: (race: Race) => React.ReactNode;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function formatDistance(value?: number): string {
  return isFiniteNumber(value) ? `${value} km` : 'Non communiqué';
}

function formatElevation(value?: number): string {
  return isFiniteNumber(value) ? `${value.toLocaleString('fr-FR')} m D+` : 'Non communiqué';
}

function formatDate(value?: string): string {
  if (!value) return 'Date à confirmer';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function formatMinutes(value?: number): string {
  if (!isFiniteNumber(value) || value <= 0) return 'Non communiqué';
  const hours = Math.floor(value / 60);
  const minutes = Math.round(value % 60);
  if (!hours) return `${minutes} min`;
  return minutes ? `${hours} h ${String(minutes).padStart(2, '0')}` : `${hours} h`;
}

function formatPace(value?: number): string | null {
  if (!isFiniteNumber(value) || value <= 0) return null;
  const minutes = Math.floor(value);
  const seconds = Math.round((value - minutes) * 60);
  return `${minutes}:${String(seconds).padStart(2, '0')}/km`;
}

function getRaceImage(race: Race): string | undefined {
  const candidate = (race as Race & { imageUrl?: string; image?: string; coverUrl?: string }).imageUrl
    ?? (race as Race & { imageUrl?: string; image?: string; coverUrl?: string }).coverUrl
    ?? (race as Race & { imageUrl?: string; image?: string; coverUrl?: string }).image;
  return candidate || undefined;
}

function getDifficultyScore(race: Race): number {
  return computeDifficultyScore(race);
}

function getCompatibilityScore(race: Race, profile: RunnerProfile | null): number | undefined {
  return computeCompatibilityScore(race, profile ?? undefined);
}

function getEstimatedEffort(race: Race, profile: RunnerProfile | null): string {
  const profilePace = profile?.averageTrailPaceMinKm ?? profile?.averageEasyPaceMinKm;
  if (isFiniteNumber(profilePace) && isFiniteNumber(race.distanceKm)) {
    return `${formatMinutes(Math.round(profilePace * race.distanceKm))} estimées (${formatPace(profilePace)})`;
  }
  if (isFiniteNumber(race.medianFinisherTimeMinutes)) {
    const medianPace = isFiniteNumber(race.distanceKm) && race.distanceKm > 0 ? race.medianFinisherTimeMinutes / race.distanceKm : undefined;
    const pace = formatPace(medianPace);
    return pace ? `${formatMinutes(race.medianFinisherTimeMinutes)} médian (${pace})` : `${formatMinutes(race.medianFinisherTimeMinutes)} médian`;
  }
  return 'Non communiqué';
}

function getInitials(name: string): string {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  return initials || 'TR';
}

function DifficultyDots({ score }: { score: number }) {
  const activeDots = Math.max(1, Math.ceil(score / 20));
  return <span className="difficulty-dots" aria-label={`Difficulté ${score} sur 100`}>
    {Array.from({ length: 5 }, (_, index) => <span key={index} className={index < activeDots ? 'is-active' : undefined} />)}
  </span>;
}

function CompatibilityRing({ score }: { score?: number }) {
  const displayScore = score ?? 0;
  return <span className="compatibility-ring" style={{ '--compatibility-score': `${displayScore * 3.6}deg` } as React.CSSProperties} aria-label={score === undefined ? 'Compatibilité indisponible' : `Compatibilité ${score} sur 100`}>
    <span>{score ?? '—'}</span>
  </span>;
}

function ComparisonCourseCard({ race, profile }: { race: Race; profile: RunnerProfile | null }) {
  const image = getRaceImage(race);
  const difficulty = getDifficultyScore(race);
  const compatibility = getCompatibilityScore(race, profile);

  return <article className="compare-card">
    <div className="compare-card-visual">
      {image ? <img src={image} alt="" /> : <span>{getInitials(race.name)}</span>}
    </div>
    <div className="compare-card-body">
      <div className="compare-card-heading">
        <h2>{race.name}</h2>
        <span className="badge compare-distance-badge">{formatDistance(race.distanceKm)}</span>
      </div>
      <dl className="compare-card-facts">
        <div><dt>Lieu</dt><dd>{race.location || race.region || 'Lieu à confirmer'}</dd></div>
        <div><dt>Date</dt><dd>{formatDate(race.date)}</dd></div>
        <div><dt>Distance</dt><dd>{formatDistance(race.distanceKm)}</dd></div>
        <div><dt>Dénivelé positif</dt><dd>{formatElevation(race.elevationGainM)}</dd></div>
        <div><dt>Terrain</dt><dd>{race.terrainType || 'Non communiqué'}</dd></div>
        <div><dt>Technicité</dt><dd>{race.technicalityLevel || 'Non communiqué'}</dd></div>
        <div><dt>Temps limite</dt><dd>{formatMinutes(race.cutoffTimeMinutes)}</dd></div>
        <div><dt>Score difficulté</dt><dd><DifficultyDots score={difficulty} /> <strong>{difficulty}/100</strong></dd></div>
        <div><dt>Compatibilité</dt><dd><CompatibilityRing score={compatibility} /></dd></div>
        <div><dt>Allure / temps</dt><dd>{getEstimatedEffort(race, profile)}</dd></div>
      </dl>
    </div>
  </article>;
}

function ComparisonRow({ label, races, render }: { label: string; races: Race[]; render: (race: Race) => React.ReactNode }) {
  return <>
    <div className="compare-row compare-row-label">{label}</div>
    {races.map((race) => <div key={`${race.id}-${label}`} className="compare-row">{render(race)}</div>)}
  </>;
}

function RecommendationBanner({ selected, profile }: { selected: Race[]; profile: RunnerProfile | null }) {
  if (!selected.length) {
    return <div className="recommendation-banner is-empty">
      <strong>Aucune course sélectionnée.</strong>
      <span>Ajoutez jusqu’à 3 courses depuis la liste ci-dessous pour lancer la comparaison.</span>
    </div>;
  }

  const easiest = [...selected].sort((a, b) => getDifficultyScore(a) - getDifficultyScore(b))[0];
  const hardest = [...selected].sort((a, b) => getDifficultyScore(b) - getDifficultyScore(a))[0];
  const bestMatch = profile ? [...selected].sort((a, b) => (getCompatibilityScore(b, profile) ?? -1) - (getCompatibilityScore(a, profile) ?? -1))[0] : undefined;

  return <div className="recommendation-banner">
    <strong>À retenir</strong>
    <span>Plus accessible : {easiest?.name} • Plus difficile : {hardest?.name}</span>
    {bestMatch ? <span>Meilleure compatibilité profil : {bestMatch.name}</span> : <span>Complétez votre profil pour obtenir la compatibilité coureur/course.</span>}
  </div>;
}

export function ComparatorPage() {
  const [races, setRaces] = useState<Race[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => { getRaces({ size: 30 }).then((r) => setRaces(r.items.map(toRace))); }, []);

  const profile = loadRunnerProfile();
  const selected = useMemo(() => races.filter((r) => selectedIds.includes(r.id)), [races, selectedIds]);

  const comparisonMetrics: ComparisonMetric[] = [
    { label: 'Lieu', render: (race) => race.location || race.region || 'Lieu à confirmer' },
    { label: 'Date', render: (race) => formatDate(race.date) },
    { label: 'Distance', render: (race) => formatDistance(race.distanceKm) },
    { label: 'Dénivelé positif', render: (race) => formatElevation(race.elevationGainM) },
    { label: 'D+/km', render: (race) => isFiniteNumber(race.elevationPerKm) ? `${race.elevationPerKm.toFixed(1)} m/km` : 'Non communiqué' },
    { label: 'Terrain', render: (race) => race.terrainType || 'Non communiqué' },
    { label: 'Technicité', render: (race) => race.technicalityLevel || 'Non communiqué' },
    { label: 'Temps limite', render: (race) => formatMinutes(race.cutoffTimeMinutes) },
    { label: 'Score difficulté', render: (race) => <span className="compare-score"><DifficultyDots score={getDifficultyScore(race)} /> {getDifficultyScore(race)}/100</span> },
    { label: 'Compatibilité', render: (race) => <CompatibilityRing score={getCompatibilityScore(race, profile)} /> },
    { label: 'Allure ou temps estimé', render: (race) => getEstimatedEffort(race, profile) },
  ];

  return <main className="compare-page">
    <div className="compare-header">
      <Link className="secondary-btn" to="/courses">← Retour aux courses</Link>
      <div>
        <h1 className="hero-title">Comparer les courses</h1>
        <p className="muted">Sélectionnez jusqu&apos;à 3 courses à comparer</p>
      </div>
      <a className="primary-btn" href="#compare-selection">Modifier la sélection</a>
    </div>

    <RecommendationBanner selected={selected} profile={profile} />

    {selected.length ? <>
      <section className="compare-card-grid" aria-label="Courses sélectionnées">
        {selected.map((race) => <ComparisonCourseCard key={race.id} race={race} profile={profile} />)}
      </section>

      <section
        className="compare-grid"
        style={{ '--compare-columns': selected.length } as React.CSSProperties}
        aria-label="Grille comparative"
      >
        <div className="compare-row compare-row-label compare-row-heading">Critère</div>
        {selected.map((race) => <div key={`${race.id}-heading`} className="compare-row compare-row-heading"><strong>{race.name}</strong></div>)}
        {comparisonMetrics.map((metric) => <ComparisonRow key={metric.label} label={metric.label} races={selected} render={metric.render} />)}
      </section>
    </> : null}

    <section id="compare-selection" className="compare-selection app-card">
      <div className="compare-selection-header">
        <div>
          <h2 className="section-title">Sélection des courses</h2>
          <p className="muted">{selected.length}/{MAX_SELECTED_RACES} course{selected.length > 1 ? 's' : ''} sélectionnée{selected.length > 1 ? 's' : ''}</p>
        </div>
        {selected.length ? <button type="button" className="secondary-btn" onClick={() => setSelectedIds([])}>Tout retirer</button> : null}
      </div>
      <div className="grid-cards compare-selection-list">
        {races.map((race) => {
          const isSelected = selectedIds.includes(race.id);
          const isDisabled = !isSelected && selectedIds.length >= MAX_SELECTED_RACES;
          return <button
            key={race.id}
            className={`compare-select-button${isSelected ? ' is-selected' : ''}`}
            type="button"
            disabled={isDisabled}
            onClick={() => setSelectedIds((previous) => previous.includes(race.id) ? previous.filter((id) => id !== race.id) : [...previous, race.id].slice(0, MAX_SELECTED_RACES))}
          >
            <span>{isSelected ? 'Retirer' : 'Ajouter'}</span>
            <strong>{race.name}</strong>
            <small>{formatDistance(race.distanceKm)} • {race.location || 'Lieu à confirmer'}</small>
          </button>;
        })}
      </div>
    </section>
  </main>;
}
