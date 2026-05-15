import { describe, expect, it } from 'vitest';
import { buildElevationProfilePath, parseGpxElevationProfile } from '../gpx';

describe('GPX elevation profile helpers', () => {
  it('parses GPX track points into an elevation profile with cumulative distance', () => {
    const profile = parseGpxElevationProfile(`
      <gpx>
        <trk><trkseg>
          <trkpt lat="45.0000" lon="6.0000"><ele>1000</ele></trkpt>
          <trkpt lat="45.0005" lon="6.0005"><ele>1040</ele></trkpt>
          <trkpt lat="45.0010" lon="6.0010"><ele>1020</ele></trkpt>
        </trkseg></trk>
      </gpx>
    `);

    expect(profile).toHaveLength(3);
    expect(profile[0]).toEqual({ distanceKm: 0, elevationM: 1000 });
    expect(profile[1].distanceKm).toBeGreaterThan(0);
    expect(profile[2].distanceKm).toBeGreaterThan(profile[1].distanceKm);
    expect(profile[1].elevationM).toBe(1040);
  });

  it('builds an SVG path from elevation profile points', () => {
    const path = buildElevationProfilePath([
      { distanceKm: 0, elevationM: 1000 },
      { distanceKm: 5, elevationM: 1200 },
      { distanceKm: 10, elevationM: 1100 },
    ]);

    expect(path).toBe('M4.0 56.0 L48.0 4.0 L92.0 30.0');
  });

  it('returns no profile for invalid GPX content', () => {
    expect(parseGpxElevationProfile('<gpx><trkpt lat="45" lon="6" /></gpx>')).toEqual([]);
    expect(parseGpxElevationProfile('')).toEqual([]);
  });
});
