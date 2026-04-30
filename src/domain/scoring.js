import { levelWeights, terrainPenalty } from "./racesData.js";

export function elevationRatio(race) { return Math.round(race.elevationGainM / race.distanceKm); }
export function getDistanceScore(distanceKm) { if (distanceKm < 20) return 10; if (distanceKm <= 42) return 25; if (distanceKm <= 70) return 45; if (distanceKm <= 100) return 65; return 85; }
export function getElevationScore(ratio) { if (ratio < 15) return 8; if (ratio <= 30) return 18; if (ratio <= 50) return 30; return 42; }
export function getTerrainScore(level) { if (level === "Modérée") return 8; if (level === "Soutenue") return 15; return 22; }
export function getCutoffScore(race) { const cutoffPace = race.cutoffTimeMinutes / race.distanceKm; if (cutoffPace >= 13) return 4; if (cutoffPace >= 11) return 8; if (cutoffPace >= 9) return 14; return 20; }
export function difficultyScore(race) { const score = getDistanceScore(race.distanceKm) * 0.55 + getElevationScore(elevationRatio(race)) * 0.8 + getTerrainScore(race.technicalityLevel) + getCutoffScore(race); return Math.min(100, Math.round(score)); }
export function difficultyLabel(score) { if (score < 35) return { label: "Accessible", color: "bg-emerald-50 text-emerald-700 ring-emerald-200" }; if (score < 60) return { label: "Modérée", color: "bg-lime-50 text-lime-700 ring-lime-200" }; if (score < 78) return { label: "Soutenue", color: "bg-orange-50 text-orange-700 ring-orange-200" }; return { label: "Difficile", color: "bg-red-50 text-red-700 ring-red-200" }; }

export function compatibilityScore(profile, race) {
  const levelWeight = levelWeights[profile.currentLevel] ?? 0.85;
  const distanceCapacity = Math.max(1, profile.maxDistanceKm * (1.25 + levelWeight * 0.55));
  const elevationCapacity = Math.max(1, profile.maxElevationGainM * (1.15 + levelWeight * 0.55));
  const distanceFit = Math.min(100, (distanceCapacity / race.distanceKm) * 100);
  const elevationFit = Math.min(100, (elevationCapacity / race.elevationGainM) * 100);
  const weeklyFit = Math.min(100, (profile.weeklyVolumeKm / Math.max(25, race.distanceKm * 0.72)) * 100);
  const timeFit = Math.min(100, (profile.availableTrainingHours / Math.max(4, race.distanceKm / 13)) * 100);
  const terrainFit = 75 + (terrainPenalty[profile.usualTerrain]?.[race.terrainType] ?? 0);
  const objectiveBonus = profile.objective === "Finir" ? 4 : profile.objective === "Préparer un ultra" && race.distanceKm >= 70 ? 7 : 0;
  const score = distanceFit * 0.27 + elevationFit * 0.22 + weeklyFit * 0.22 + timeFit * 0.16 + terrainFit * 0.13 + objectiveBonus;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function compatibilityVerdict(score) { if (score < 40) return { label: "Trop ambitieux actuellement", color: "text-red-700", bg: "bg-red-50" }; if (score < 60) return { label: "Possible mais risqué", color: "text-orange-700", bg: "bg-orange-50" }; if (score < 80) return { label: "Ambitieux mais réaliste", color: "text-emerald-800", bg: "bg-emerald-50" }; return { label: "Très adapté", color: "text-emerald-800", bg: "bg-emerald-50" }; }
