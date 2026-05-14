import type { RaceDto, TechnicalityLevel as ApiTechnicalityLevel, TerrainType as ApiTerrainType } from '../api/types';
import type { Race, RaceTechnicalityLevel, RunnerProfile, TerrainType } from './types';

const TECH_WEIGHT = { facile: 0.2, moderee: 0.45, technique: 0.7, 'tres-technique': 1 } as const;
const TERRAIN_WEIGHT = { route: 0.1, mixte: 0.35, sentier: 0.55, montagne: 0.9 } as const;
const PROFILE_KEY = 'trailmatch.runnerProfile';

const TERRAIN_TYPE_MAP: Record<ApiTerrainType, TerrainType> = {
  MOUNTAIN: 'montagne',
  FOREST: 'sentier',
  MIXED: 'mixte',
  ROAD: 'route',
  DESERT: 'sentier',
};

const TECHNICALITY_LEVEL_MAP: Record<ApiTechnicalityLevel, RaceTechnicalityLevel> = {
  EASY: 'facile',
  MODERATE: 'moderee',
  HARD: 'technique',
  EXTREME: 'tres-technique',
};

export function toRace(dto: RaceDto): Race {
  return {
    ...dto,
    region: dto.region,
    elevationPerKm: Number((dto.elevationGainM / Math.max(dto.distanceKm, 1)).toFixed(1)),
    terrainType: TERRAIN_TYPE_MAP[dto.terrainType],
    technicalityLevel: TECHNICALITY_LEVEL_MAP[dto.technicalityLevel],
    cutoffTimeMinutes: dto.cutoffTimeMinutes,
    lastFinisherTimeMinutes: dto.lastFinisherTimeMinutes,
    medianFinisherTimeMinutes: dto.medianFinisherTimeMinutes,
    aidStationsCount: dto.aidStationsCount,
    priceEur: dto.priceEur,
    description: dto.description,
    tags: dto.tags,
    sourceUrl: dto.sourceUrl,
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
