import React, { useMemo, useState } from "react";
import { races, levelWeights, terrainPenalty } from "./src/domain/racesData.js";
import { compatibilityScore, compatibilityVerdict, difficultyLabel, difficultyScore, elevationRatio, getDistanceScore } from "./src/domain/scoring.js";
import { formatDate, formatDuration, formatPace } from "./src/utils/formatters.js";

const iconPaths = {
  activity: "M4 12h4l2-7 4 14 2-7h4",
  calendar: "M7 2v3M17 2v3M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z",
  chevronRight: "m9 18 6-6-6-6",
  clock: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2",
  compass: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm3-13-2 6-6 2 2-6 6-2Z",
  filter: "M4 5h16M7 12h10M10 19h4",
  flag: "M5 22V4m0 0h12l-1.5 4L17 12H5",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z",
  mapPin: "M12 22s7-5.2 7-12A7 7 0 0 0 5 10c0 6.8 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  mountain: "m3 20 7-13 4 7 2-3 5 9H3Z",
  route: "M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 16h3.5A4.5 4.5 0 0 0 14 11.5V8h1",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm10 2-4.3-4.3",
  shieldCheck: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Zm-3-10 2 2 4-5",
  sliders: "M4 6h10M18 6h2M4 12h2M10 12h10M4 18h10M18 18h2M14 4v4M8 10v4M14 16v4",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-4a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  trendingUp: "M3 17 9 11l4 4 7-8M14 7h6v6",
  trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Zm0 2H4v3a3 3 0 0 0 3 3m10-6h3v3a3 3 0 0 1-3 3",
  user: "M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  zap: "M13 2 3 14h8l-1 8 10-12h-8l1-8Z",
};

function Icon({ name, size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={iconPaths[name] || iconPaths.activity} />
    </svg>
  );
}

function cx(...classes) { return classes.filter(Boolean).join(" "); }

function runSelfTests() {
  const assert = (condition, message) => { if (!condition) throw new Error(`TrailMatch self-test failed: ${message}`); };
  assert(formatDuration(605) === "10h05", "formatDuration should format hours and minutes");
  assert(formatDuration(0) === "0h00", "formatDuration should handle zero");
  assert(formatPace(90, 10) === "9’00/km", "formatPace should format min/km");
  assert(formatPace(599, 60) === "9’59/km", "formatPace should handle rounded seconds");
  assert(elevationRatio({ elevationGainM: 950, distanceKm: 42 }) === 23, "elevationRatio should round D+/km");
  assert(getDistanceScore(42) === 25, "42 km should be in the 20-42 bucket");
  assert(getDistanceScore(115) === 85, "115 km should be in the 100+ bucket");
  assert(difficultyScore(races[0]) >= 0 && difficultyScore(races[0]) <= 100, "difficultyScore should stay between 0 and 100");
  assert(compatibilityScore({ maxDistanceKm: 42, maxElevationGainM: 1000, weeklyVolumeKm: 35, availableTrainingHours: 5, currentLevel: "Régulier", objective: "Finir", usualTerrain: "Vallonné" }, races[0]) >= 0, "compatibilityScore should not be negative");
}
runSelfTests();

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-900 text-white shadow-sm"><Icon name="mountain" size={23} /></div>
      <span className="text-2xl font-black tracking-tight text-emerald-950">Trail<span className="text-orange-500">Match</span></span>
    </div>
  );
}
function Pill({ children, className = "" }) { return <span className={cx("inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1", className)}>{children}</span>; }
function RaceVisual({ race, compact = false }) {
  return (
    <div className={cx("relative overflow-hidden bg-gradient-to-br", race.gradient, compact ? "h-9 w-9 rounded-full" : "h-44 w-full")}>
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/45 to-transparent" />
      <svg className="absolute bottom-0 left-0 h-24 w-full text-white/25" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 120 90 35 150 80 225 18 310 95 400 45 400 120Z" fill="currentColor" /></svg>
      {!compact && <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white/90"><Icon name="mountain" size={18} /><span className="text-xs font-black uppercase tracking-wide">Trail terrain</span></div>}
    </div>
  );
}
function SelectBox({ icon, label, value, options, onChange }) {
  return (
    <label className="group flex min-w-0 flex-1 items-center gap-3 border-b border-stone-200 px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900 group-focus-within:ring-2 group-focus-within:ring-orange-400"><Icon name={icon} size={18} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</span>
        <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full appearance-none bg-transparent text-sm font-bold text-emerald-950 outline-none">
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </span>
    </label>
  );
}
function RaceCard({ race, selected, onToggleCompare }) {
  const score = difficultyScore(race);
  const label = difficultyLabel(score);
  return (
    <article className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative">
        <RaceVisual race={race} />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">{race.tags.slice(0, 2).map((tag) => <Pill key={tag} className="bg-white/90 text-emerald-900 ring-white/60 backdrop-blur">{tag}</Pill>)}</div>
        <button type="button" aria-label="Ajouter aux favoris" className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-emerald-950 backdrop-blur transition hover:bg-white"><Icon name="heart" size={18} /></button>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-black text-emerald-950">{race.name}</h3>
        <p className="mt-2 flex items-center gap-2 text-sm text-stone-600"><Icon name="mapPin" size={15} /> {race.location}, {race.region}</p>
        <p className="mt-1 flex items-center gap-2 text-sm text-stone-600"><Icon name="calendar" size={15} /> {formatDate(race.date)}</p>
        <div className="mt-5 grid grid-cols-3 gap-3 border-y border-stone-100 py-4">
          <div><p className="text-lg font-black text-emerald-950">{race.distanceKm} km</p><p className="text-xs font-medium text-stone-500">Distance</p></div>
          <div><p className="text-lg font-black text-emerald-950">{race.elevationGainM} m</p><p className="text-xs font-medium text-stone-500">D+</p></div>
          <div><p className="text-lg font-black text-emerald-950">{elevationRatio(race)} m/km</p><p className="text-xs font-medium text-stone-500">Ratio</p></div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2"><Pill className={label.color}>{label.label}</Pill><Pill className="bg-stone-50 text-stone-700 ring-stone-200">{race.terrainType}</Pill><Pill className="bg-stone-50 text-stone-700 ring-stone-200">{formatDuration(race.cutoffTimeMinutes)} max</Pill></div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button className="rounded-2xl border border-stone-200 px-4 py-3 text-sm font-bold text-emerald-950 transition hover:border-emerald-900 hover:bg-emerald-50">Voir la course</button>
          <button type="button" onClick={() => onToggleCompare(race.id)} className={cx("rounded-2xl px-4 py-3 text-sm font-black transition", selected ? "bg-emerald-900 text-white hover:bg-emerald-950" : "bg-orange-500 text-white hover:bg-orange-600")}>{selected ? "Sélectionnée" : "Comparer"}</button>
        </div>
      </div>
    </article>
  );
}
function CompareTable({ selectedRaces }) {
  const rows = [
    { label: "Distance", icon: "route", get: (race) => `${race.distanceKm} km` },
    { label: "Dénivelé positif", icon: "mountain", get: (race) => `${race.elevationGainM} m` },
    { label: "Ratio D+/km", icon: "trendingUp", get: (race) => `${elevationRatio(race)} m/km` },
    { label: "Terrain", icon: "compass", get: (race) => race.terrainType },
    { label: "Barrière horaire", icon: "clock", get: (race) => formatDuration(race.cutoffTimeMinutes) },
    { label: "Dernier finisher", icon: "trophy", get: (race) => formatDuration(race.lastFinisherTimeMinutes) },
    { label: "Allure dernier", icon: "activity", get: (race) => formatPace(race.lastFinisherTimeMinutes, race.distanceKm) },
    { label: "Score difficulté", icon: "zap", get: (race) => `${difficultyScore(race)}/100`, highlight: true },
  ];
  if (selectedRaces.length === 0) return <div className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center text-stone-600">Sélectionnez au moins une course pour lancer le comparateur.</div>;
  return (
    <div className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead><tr className="bg-emerald-50/80 text-left text-emerald-950"><th className="w-64 px-5 py-4 font-black">Critère</th>{selectedRaces.map((race) => <th key={race.id} className="px-5 py-4 font-black"><div className="flex items-center gap-3"><RaceVisual race={race} compact />{race.name}</div></th>)}</tr></thead>
          <tbody>{rows.map((row) => <tr key={row.label} className="border-t border-stone-100"><td className="px-5 py-4 font-bold text-stone-700"><span className="flex items-center gap-2"><Icon name={row.icon} size={17} className="text-emerald-900" /> {row.label}</span></td>{selectedRaces.map((race) => <td key={`${row.label}-${race.id}`} className={cx("px-5 py-4 font-semibold text-emerald-950", row.highlight && difficultyScore(race) >= 75 && "text-orange-600")}>{row.get(race)}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
function CompatibilityPanel({ profile, setProfile, selectedRace }) {
  const score = compatibilityScore(profile, selectedRace);
  const verdict = compatibilityVerdict(score);
  const updateNumber = (key, value) => setProfile((current) => ({ ...current, [key]: Number(value) }));
  const updateText = (key, value) => setProfile((current) => ({ ...current, [key]: value }));
  const fieldClass = "mt-2 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-bold text-emerald-950 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100";
  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.35fr]">
      <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-900"><Icon name="user" size={21} /></div><div><h3 className="text-xl font-black text-emerald-950">Profil coureur</h3><p className="text-sm text-stone-500">Renseignez votre niveau actuel.</p></div></div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <label><span className="text-sm font-bold text-stone-700">Distance max déjà faite</span><input type="number" value={profile.maxDistanceKm} onChange={(event) => updateNumber("maxDistanceKm", event.target.value)} className={fieldClass} /></label>
          <label><span className="text-sm font-bold text-stone-700">D+ max déjà fait</span><input type="number" value={profile.maxElevationGainM} onChange={(event) => updateNumber("maxElevationGainM", event.target.value)} className={fieldClass} /></label>
          <label><span className="text-sm font-bold text-stone-700">Volume hebdo actuel</span><input type="number" value={profile.weeklyVolumeKm} onChange={(event) => updateNumber("weeklyVolumeKm", event.target.value)} className={fieldClass} /></label>
          <label><span className="text-sm font-bold text-stone-700">Temps dispo/semaine</span><input type="number" value={profile.availableTrainingHours} onChange={(event) => updateNumber("availableTrainingHours", event.target.value)} className={fieldClass} /></label>
          <label><span className="text-sm font-bold text-stone-700">Niveau actuel</span><select value={profile.currentLevel} onChange={(event) => updateText("currentLevel", event.target.value)} className={fieldClass}>{Object.keys(levelWeights).map((level) => <option key={level}>{level}</option>)}</select></label>
          <label><span className="text-sm font-bold text-stone-700">Terrain habituel</span><select value={profile.usualTerrain} onChange={(event) => updateText("usualTerrain", event.target.value)} className={fieldClass}>{Object.keys(terrainPenalty).map((terrain) => <option key={terrain}>{terrain}</option>)}</select></label>
        </div>
        <label className="mt-4 block"><span className="text-sm font-bold text-stone-700">Objectif principal</span><select value={profile.objective} onChange={(event) => updateText("objective", event.target.value)} className={fieldClass}><option>Finir</option><option>Progresser</option><option>Performance</option><option>Préparer un ultra</option></select></label>
      </div>
      <div className={cx("rounded-3xl border border-stone-200 p-6 shadow-sm", verdict.bg)}>
        <div className="grid gap-8 md:grid-cols-[220px_1fr] md:items-center">
          <div className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-white shadow-inner"><div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(#166534 ${score * 3.6}deg, #fed7aa ${score * 3.6}deg 360deg)` }} /><div className="absolute inset-5 rounded-full bg-white" /><div className="relative text-center"><p className="text-xs font-bold uppercase tracking-wide text-stone-500">Compatibilité</p><p className="mt-1 text-5xl font-black text-emerald-950">{score}</p><p className="font-bold text-stone-600">/100</p></div></div>
          <div><p className="text-sm font-bold uppercase tracking-wide text-stone-500">Course évaluée</p><h3 className="mt-1 text-2xl font-black text-emerald-950">{selectedRace.name}</h3><p className={cx("mt-2 text-xl font-black", verdict.color)}>{verdict.label}</p><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{selectedRace.description}</p><div className="mt-6 grid gap-5 md:grid-cols-2"><div><h4 className="font-black text-emerald-950">Points forts</h4><ul className="mt-3 space-y-2 text-sm text-stone-700"><li className="flex gap-2"><Icon name="shieldCheck" className="text-emerald-700" size={17} /> Analyse distance / D+ cohérente</li><li className="flex gap-2"><Icon name="shieldCheck" className="text-emerald-700" size={17} /> Objectif pris en compte</li><li className="flex gap-2"><Icon name="shieldCheck" className="text-emerald-700" size={17} /> Barrières horaires visibles</li></ul></div><div><h4 className="font-black text-emerald-950">Points de vigilance</h4><ul className="mt-3 space-y-2 text-sm text-stone-700"><li className="flex gap-2"><Icon name="flag" className="text-orange-600" size={17} /> Prévoir une progression spécifique</li><li className="flex gap-2"><Icon name="flag" className="text-orange-600" size={17} /> Tester nutrition et ravitos</li><li className="flex gap-2"><Icon name="flag" className="text-orange-600" size={17} /> Garder une marge chrono</li></ul></div></div></div>
        </div>
      </div>
    </div>
  );
}

export default function TrailMatchMvp() {
  const [filters, setFilters] = useState({ region: "Toutes les régions", month: "Tous les mois", distance: "Toutes distances", elevation: "Tous D+", terrain: "Tous terrains" });
  const [selectedIds, setSelectedIds] = useState([1, 2, 3]);
  const [profile, setProfile] = useState({ maxDistanceKm: 42, maxElevationGainM: 1000, weeklyVolumeKm: 35, availableTrainingHours: 5, currentLevel: "Régulier", objective: "Finir", usualTerrain: "Vallonné" });
  const filteredRaces = useMemo(() => races.filter((race) => {
    if (filters.region !== "Toutes les régions" && race.region !== filters.region) return false;
    if (filters.terrain !== "Tous terrains" && race.terrainType !== filters.terrain) return false;
    if (filters.distance === "Moins de 50 km" && race.distanceKm >= 50) return false;
    if (filters.distance === "50 à 80 km" && (race.distanceKm < 50 || race.distanceKm > 80)) return false;
    if (filters.distance === "80 km et plus" && race.distanceKm < 80) return false;
    if (filters.elevation === "Moins de 1500 m" && race.elevationGainM >= 1500) return false;
    if (filters.elevation === "1500 à 3000 m" && (race.elevationGainM < 1500 || race.elevationGainM > 3000)) return false;
    if (filters.elevation === "3000 m et plus" && race.elevationGainM < 3000) return false;
    return true;
  }), [filters]);
  const selectedRaces = races.filter((race) => selectedIds.includes(race.id)).slice(0, 4);
  const evaluatedRace = selectedRaces[1] ?? selectedRaces[0] ?? races[0];
  const recommendedRaces = [...races].map((race) => ({ race, score: compatibilityScore(profile, race) })).sort((a, b) => b.score - a.score).slice(0, 3);
  function toggleCompare(id) { setSelectedIds((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : current.length >= 4 ? [...current.slice(1), id] : [...current, id]); }

  return (
    <main className="min-h-screen bg-stone-50 font-sans text-emerald-950">
      <header className="sticky top-0 z-40 border-b border-white/20 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8"><Logo /><nav className="hidden items-center gap-8 text-sm font-bold text-stone-700 md:flex"><a href="#courses" className="hover:text-orange-500">Courses</a><a href="#comparer" className="hover:text-orange-500">Comparer</a><a href="#profil" className="hover:text-orange-500">Profil coureur</a><a href="#apropos" className="hover:text-orange-500">À propos</a></nav><a href="#profil" className="hidden rounded-2xl bg-orange-500 px-5 py-3 text-sm font-black text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600 sm:block">Trouver ma course</a><button className="rounded-2xl border border-stone-200 p-3 md:hidden" aria-label="Ouvrir les filtres"><Icon name="sliders" size={20} /></button></div></header>
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900"><div className="absolute inset-0 opacity-30"><svg viewBox="0 0 1200 420" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true"><path d="M0 420 250 120 390 260 570 80 780 290 980 100 1200 300 1200 420Z" fill="white" opacity="0.18" /><path d="M0 420 180 250 310 330 520 170 710 340 890 210 1200 390 1200 420Z" fill="white" opacity="0.16" /></svg></div><div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-stone-50 to-transparent" /><div className="relative mx-auto max-w-7xl px-5 pb-12 pt-16 lg:px-8 lg:pb-20 lg:pt-24"><div className="max-w-3xl"><Pill className="bg-white/15 text-white ring-white/25 backdrop-blur">MVP comparateur trail/running</Pill><h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-7xl">Trouvez la course trail qui vous correspond vraiment</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl">Comparez les courses selon la distance, le dénivelé, le terrain, les barrières horaires et votre profil coureur.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#profil" className="rounded-2xl bg-orange-500 px-6 py-4 text-center font-black text-white shadow-xl shadow-orange-500/25 transition hover:bg-orange-600">Trouver ma course</a><a href="#comparer" className="rounded-2xl bg-white/15 px-6 py-4 text-center font-black text-white ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25">Comparer des courses</a></div></div><div className="mt-12 overflow-hidden rounded-3xl border border-white/60 bg-white shadow-2xl shadow-emerald-950/20"><div className="grid sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]"><SelectBox icon="mapPin" label="Région" value={filters.region} options={["Toutes les régions", ...Array.from(new Set(races.map((race) => race.region)))]} onChange={(value) => setFilters((current) => ({ ...current, region: value }))} /><SelectBox icon="calendar" label="Mois" value={filters.month} options={["Tous les mois", "Avril", "Juin", "Juillet", "Septembre", "Décembre"]} onChange={(value) => setFilters((current) => ({ ...current, month: value }))} /><SelectBox icon="route" label="Distance" value={filters.distance} options={["Toutes distances", "Moins de 50 km", "50 à 80 km", "80 km et plus"]} onChange={(value) => setFilters((current) => ({ ...current, distance: value }))} /><SelectBox icon="mountain" label="D+" value={filters.elevation} options={["Tous D+", "Moins de 1500 m", "1500 à 3000 m", "3000 m et plus"]} onChange={(value) => setFilters((current) => ({ ...current, elevation: value }))} /><SelectBox icon="compass" label="Terrain" value={filters.terrain} options={["Tous terrains", ...Array.from(new Set(races.map((race) => race.terrainType)))]} onChange={(value) => setFilters((current) => ({ ...current, terrain: value }))} /><div className="flex items-center p-3"><a href="#courses" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-4 text-sm font-black text-white transition hover:bg-orange-600"><Icon name="search" size={18} /> Rechercher</a></div></div></div></div></section>
      <section id="courses" className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-orange-500"><Icon name="filter" size={17} /> Données de démonstration</p><h2 className="mt-2 text-3xl font-black tracking-tight text-emerald-950">Courses recommandées</h2><p className="mt-2 max-w-2xl text-stone-600">Une sélection de courses pour tester la logique MVP : difficulté réelle, barrières, allure et compatibilité.</p></div><a href="#comparer" className="inline-flex items-center gap-2 font-black text-emerald-900 hover:text-orange-500">Voir le comparateur <Icon name="chevronRight" size={18} /></a></div><div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{filteredRaces.map((race) => <RaceCard key={race.id} race={race} selected={selectedIds.includes(race.id)} onToggleCompare={toggleCompare} />)}</div></section>
      <section id="comparer" className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h2 className="text-3xl font-black tracking-tight text-emerald-950">Comparateur côte à côte</h2><p className="mt-2 text-stone-600">Sélectionnez jusqu’à 4 courses pour comparer les critères qui comptent vraiment.</p></div><Pill className="bg-emerald-50 text-emerald-800 ring-emerald-200">{selectedRaces.length}/4 courses sélectionnées</Pill></div><CompareTable selectedRaces={selectedRaces} /></section>
      <section id="profil" className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="mb-6"><h2 className="text-3xl font-black tracking-tight text-emerald-950">Compatibilité coureur / course</h2><p className="mt-2 max-w-2xl text-stone-600">Le score compare votre historique, votre volume, votre terrain habituel et la difficulté réelle de la course.</p></div><CompatibilityPanel profile={profile} setProfile={setProfile} selectedRace={evaluatedRace} /></section>
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-stone-200 lg:p-10"><div className="text-center"><h2 className="text-3xl font-black tracking-tight text-emerald-950">Comment ça marche ?</h2><p className="mx-auto mt-3 max-w-2xl text-stone-600">Un parcours simple : profil, comparaison, décision réaliste.</p></div><div className="mt-10 grid gap-6 md:grid-cols-3">{[{ icon: "user", title: "Renseignez votre profil", text: "Distance maximale, D+ déjà réalisé, volume actuel, temps disponible et objectif." }, { icon: "target", title: "Comparez les courses", text: "Analysez distance, D+, ratio, barrières horaires, temps des derniers finishers et terrain." }, { icon: "flag", title: "Choisissez un objectif réaliste", text: "Identifiez la course adaptée ou une étape intermédiaire pour progresser sans vous cramer." }].map((item, index) => <div key={item.title} className="relative rounded-3xl bg-stone-50 p-6"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-900 text-white"><Icon name={item.icon} size={25} /></div><span className="absolute right-6 top-6 text-5xl font-black text-emerald-900/10">{index + 1}</span><h3 className="mt-5 text-xl font-black text-emerald-950">{item.title}</h3><p className="mt-3 text-sm leading-6 text-stone-600">{item.text}</p></div>)}</div></div></section>
      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8"><div className="overflow-hidden rounded-[2rem] bg-emerald-950 p-8 shadow-xl lg:p-10"><div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center"><div><p className="text-sm font-black uppercase tracking-wide text-orange-400">TrailMatch</p><h2 className="mt-2 text-3xl font-black text-white">Prêt à trouver votre prochaine aventure ?</h2><p className="mt-3 max-w-2xl text-white/75">Des centaines de courses analysées pour vous aider à viser juste, sans choisir uniquement sur la hype.</p></div><a href="#profil" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-4 font-black text-white transition hover:bg-orange-600">Trouver ma course <Icon name="chevronRight" size={19} /></a></div></div></section>
      <section className="mx-auto max-w-7xl px-5 pb-12 lg:px-8"><h2 className="text-2xl font-black text-emerald-950">Top recommandations selon votre profil</h2><div className="mt-5 grid gap-4 md:grid-cols-3">{recommendedRaces.map(({ race, score }) => { const verdict = compatibilityVerdict(score); return <div key={race.id} className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-black text-emerald-950">{race.name}</h3><p className="mt-1 text-sm text-stone-500">{race.distanceKm} km · {race.elevationGainM} m D+</p></div><Pill className="bg-emerald-50 text-emerald-800 ring-emerald-200">{score}/100</Pill></div><p className={cx("mt-4 font-black", verdict.color)}>{verdict.label}</p></div>; })}</div></section>
      <footer id="apropos" className="bg-emerald-950 px-5 py-12 text-white lg:px-8"><div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]"><div><Logo /><p className="mt-4 max-w-sm text-sm leading-6 text-white/70">Le comparateur de courses trail pensé pour les coureurs qui veulent choisir avec lucidité.</p></div><div><h4 className="font-black">Navigation</h4><ul className="mt-4 space-y-3 text-sm text-white/70"><li>Courses</li><li>Comparer</li><li>Profil coureur</li><li>À propos</li></ul></div><div><h4 className="font-black">Ressources</h4><ul className="mt-4 space-y-3 text-sm text-white/70"><li>Guides entraînement</li><li>Conseils nutrition</li><li>Glossaire trail</li><li>FAQ</li></ul></div><div><h4 className="font-black">Newsletter</h4><p className="mt-4 text-sm text-white/70">Recevez nos sélections de courses chaque mois.</p><div className="mt-4 flex overflow-hidden rounded-2xl bg-white p-1"><input placeholder="Votre email" className="min-w-0 flex-1 px-3 text-sm text-emerald-950 outline-none" /><button className="rounded-xl bg-orange-500 px-4 py-2 font-black text-white">OK</button></div></div></div><p className="mx-auto mt-10 max-w-7xl text-xs text-white/50">© 2026 TrailMatch — Données de démonstration.</p></footer>
    </main>
  )
}
