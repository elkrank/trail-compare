export type RaceTechnicalityLevel = 'facile' | 'moderee' | 'technique' | 'tres-technique';
export type TerrainType = 'route' | 'mixte' | 'sentier' | 'montagne';

export interface Race {
  id: string;
  name: string;
  location: string;
  region: string;
  date: string;
  distanceKm: number;
  elevationGainM: number;
  elevationPerKm: number;
  terrainType: TerrainType;
  technicalityLevel: RaceTechnicalityLevel;
  cutoffTimeMinutes: number;
  lastFinisherTimeMinutes: number;
  medianFinisherTimeMinutes: number;
  aidStationsCount: number;
  priceEur?: number;
  description: string;
  tags: string[];
  sourceUrl?: string;
  gradient?: string;
}

export interface RunnerProfile {
  id?: string;
  maxDistanceKm: number;
  maxElevationGainM: number;
  weeklyVolumeKm: number;
  weeklyTrainingHours: number;
  longestRecentRunKm: number;
  currentFitnessLevel: 'debutant' | 'intermediaire' | 'avance';
  usualTerrain: TerrainType;
  objective: 'finir' | 'progresser' | 'performance' | 'reprise' | 'ultra';
  targetDate?: string;
  averageEasyPaceMinKm?: number;
  averageTrailPaceMinKm?: number;
}

export interface RaceComparisonResult {
  raceId: string;
  difficultyScore: number;
  compatibilityScore?: number;
}

export interface Comparison {
  selectedRaceIds: string[];
  runnerProfile?: RunnerProfile;
  results: RaceComparisonResult[];
}
