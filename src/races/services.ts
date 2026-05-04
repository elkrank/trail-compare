import type { RaceDto } from '../api/types';
import type { Race, RunnerProfile } from './types';

const TECH_WEIGHT = { facile: 0.2, moderee: 0.45, technique: 0.7, 'tres-technique': 1 } as const;
const TERRAIN_WEIGHT = { route: 0.1, mixte: 0.35, sentier: 0.55, montagne: 0.9 } as const;
const PROFILE_KEY = 'trailmatch.runnerProfile';

export function toRace(dto: RaceDto): Race {
  const ratio = Number((dto.elevationGainM / Math.max(dto.distanceKm, 1)).toFixed(1));
  return {
    ...dto,
    region: dto.location,
    elevationPerKm: ratio,
    terrainType: ratio > 55 ? 'montagne' : ratio > 30 ? 'sentier' : 'mixte',
    technicalityLevel: ratio > 65 ? 'tres-technique' : ratio > 40 ? 'technique' : ratio > 20 ? 'moderee' : 'facile',
    cutoffTimeMinutes: Math.round(dto.distanceKm * (ratio > 40 ? 13 : 10)),
    lastFinisherTimeMinutes: Math.round(dto.distanceKm * (ratio > 40 ? 12.1 : 9.2)),
    medianFinisherTimeMinutes: Math.round(dto.distanceKm * (ratio > 40 ? 9.8 : 7.5)),
    aidStationsCount: Math.max(1, Math.round(dto.distanceKm / 18)),
    priceEur: dto.distanceKm > 60 ? 90 : dto.distanceKm > 30 ? 55 : 35,
    description: `Parcours ${dto.name} avec profil ${ratio} m D+/km.`,
    tags: [ratio > 50 ? 'montagne' : 'roulant', dto.distanceKm > 42 ? 'longue-distance' : 'format-court'],
  };
}

export const computePaces = (race: Race) => ({
  cutoffPaceMinKm: race.cutoffTimeMinutes / race.distanceKm,
  lastFinisherPaceMinKm: race.lastFinisherTimeMinutes / race.distanceKm,
  medianPaceMinKm: race.medianFinisherTimeMinutes / race.distanceKm,
});

export function computeDifficultyScore(race: Race): number {
  const distance = Math.min(race.distanceKm / 80, 1) * 25;
  const dPlus = Math.min(race.elevationGainM / 4500, 1) * 25;
  const ratio = Math.min(race.elevationPerKm / 90, 1) * 20;
  const tech = TECH_WEIGHT[race.technicalityLevel] * 15;
  const terrain = TERRAIN_WEIGHT[race.terrainType] * 7;
  const cutoffPressure = Math.max(0, (8 - computePaces(race).cutoffPaceMinKm) * 4);
  return Math.min(100, Math.round(distance + dPlus + ratio + tech + terrain + cutoffPressure));
}

export function computeCompatibilityScore(race: Race, profile?: RunnerProfile): number | undefined {
  if (!profile) return undefined;
  let score = 100;
  score -= Math.max(0, (race.distanceKm - profile.maxDistanceKm) * 1.1);
  score -= Math.max(0, (race.elevationGainM - profile.maxElevationGainM) / 90);
  score -= Math.max(0, (race.distanceKm / 10 - profile.weeklyVolumeKm / 12) * 7);
  score -= Math.max(0, computeDifficultyScore(race) - (profile.currentFitnessLevel === 'avance' ? 85 : profile.currentFitnessLevel === 'intermediaire' ? 65 : 45)) * 0.35;
  if (profile.usualTerrain !== race.terrainType) score -= 8;
  return Math.max(0, Math.round(score));
}

export function saveRunnerProfile(profile: RunnerProfile) { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }
export function loadRunnerProfile(): RunnerProfile | null {
  const raw = localStorage.getItem(PROFILE_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as RunnerProfile; } catch { return null; }
}
