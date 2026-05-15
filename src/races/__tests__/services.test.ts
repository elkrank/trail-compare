import { describe, expect, it } from 'vitest';
import type { RaceDto } from '../../api/types';
import { toRace } from '../services';

const completeRaceDto: RaceDto = {
  id: 'race-1',
  name: 'Trail API préservé',
  location: 'Chamonix',
  region: 'Auvergne-Rhône-Alpes',
  date: '2026-07-18',
  distanceKm: 50,
  elevationGainM: 2500,
  terrainType: 'MOUNTAIN',
  technicalityLevel: 'EXTREME',
  cutoffTimeMinutes: 740,
  lastFinisherTimeMinutes: 705,
  medianFinisherTimeMinutes: 550,
  aidStationsCount: 6,
  priceEur: 88,
  description: 'Description fournie par l’API.',
  tags: ['api', 'preserve'],
  sourceUrl: 'https://example.test/races/race-1',
  gpxUrl: 'https://example.test/races/race-1.gpx',
  hasGpx: true,
  isCancelled: false,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('toRace', () => {
  it('preserves complete DTO values instead of recomputing or overwriting them', () => {
    const race = toRace(completeRaceDto);

    expect(race).toMatchObject({
      id: completeRaceDto.id,
      name: completeRaceDto.name,
      location: completeRaceDto.location,
      region: completeRaceDto.region,
      date: completeRaceDto.date,
      distanceKm: completeRaceDto.distanceKm,
      elevationGainM: completeRaceDto.elevationGainM,
      cutoffTimeMinutes: completeRaceDto.cutoffTimeMinutes,
      lastFinisherTimeMinutes: completeRaceDto.lastFinisherTimeMinutes,
      medianFinisherTimeMinutes: completeRaceDto.medianFinisherTimeMinutes,
      aidStationsCount: completeRaceDto.aidStationsCount,
      priceEur: completeRaceDto.priceEur,
      description: completeRaceDto.description,
      sourceUrl: completeRaceDto.sourceUrl,
      gpxUrl: completeRaceDto.gpxUrl,
      hasGpx: completeRaceDto.hasGpx,
    });
    expect(race.tags).toBe(completeRaceDto.tags);
    expect(race.region).not.toBe(completeRaceDto.location);
    expect(race.elevationPerKm).toBe(50);
  });

  it.each([
    ['MOUNTAIN', 'montagne'],
    ['FOREST', 'sentier'],
    ['MIXED', 'mixte'],
    ['ROAD', 'route'],
    ['DESERT', 'sentier'],
  ] as const)('maps API terrain type %s to frontend value %s', (terrainType, expected) => {
    expect(toRace({ ...completeRaceDto, terrainType }).terrainType).toBe(expected);
  });

  it.each([
    ['EASY', 'facile'],
    ['MODERATE', 'moderee'],
    ['HARD', 'technique'],
    ['EXTREME', 'tres-technique'],
  ] as const)('maps API technicality level %s to frontend value %s', (technicalityLevel, expected) => {
    expect(toRace({ ...completeRaceDto, technicalityLevel }).technicalityLevel).toBe(expected);
  });
});
