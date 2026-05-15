export interface ElevationProfilePoint {
  distanceKm: number;
  elevationM: number;
}

const EARTH_RADIUS_M = 6_371_000;
const MAX_PROFILE_POINTS = 80;

function toFiniteNumber(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function distanceBetweenPointsMeters(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLon = toRadians(b.lon - a.lon);
  const haversine = Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function simplifyProfile(points: ElevationProfilePoint[]): ElevationProfilePoint[] {
  if (points.length <= MAX_PROFILE_POINTS) return points;

  const simplified: ElevationProfilePoint[] = [];
  const lastIndex = points.length - 1;
  for (let i = 0; i < MAX_PROFILE_POINTS; i += 1) {
    const sourceIndex = Math.round((i / (MAX_PROFILE_POINTS - 1)) * lastIndex);
    simplified.push(points[sourceIndex]);
  }
  return simplified;
}

export function parseGpxElevationProfile(gpxXml: string): ElevationProfilePoint[] {
  if (typeof DOMParser === 'undefined' || !gpxXml.trim()) return [];

  const document = new DOMParser().parseFromString(gpxXml, 'application/xml');
  if (document.querySelector('parsererror')) return [];

  const trackPoints = Array.from(document.querySelectorAll('trkpt, rtept'));
  const parsedPoints = trackPoints.map((point) => {
    const lat = toFiniteNumber(point.getAttribute('lat'));
    const lon = toFiniteNumber(point.getAttribute('lon'));
    const elevation = toFiniteNumber(point.querySelector('ele')?.textContent);
    return lat === null || lon === null || elevation === null ? null : { lat, lon, elevation };
  }).filter((point): point is { lat: number; lon: number; elevation: number } => point !== null);

  if (parsedPoints.length < 2) return [];

  let distanceM = 0;
  const profile = parsedPoints.map((point, index) => {
    if (index > 0) {
      distanceM += distanceBetweenPointsMeters(parsedPoints[index - 1], point);
    }
    return {
      distanceKm: Number((distanceM / 1000).toFixed(3)),
      elevationM: point.elevation,
    };
  });

  return simplifyProfile(profile);
}

export function buildElevationProfilePath(points: ElevationProfilePoint[], width = 96, height = 60, padding = 4): string | null {
  if (points.length < 2) return null;

  const distances = points.map((point) => point.distanceKm);
  const elevations = points.map((point) => point.elevationM);
  const minDistance = Math.min(...distances);
  const maxDistance = Math.max(...distances);
  const minElevation = Math.min(...elevations);
  const maxElevation = Math.max(...elevations);
  const distanceSpan = Math.max(maxDistance - minDistance, 0.001);
  const elevationSpan = Math.max(maxElevation - minElevation, 1);
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  return points.map((point, index) => {
    const x = padding + ((point.distanceKm - minDistance) / distanceSpan) * chartWidth;
    const y = padding + (1 - (point.elevationM - minElevation) / elevationSpan) * chartHeight;
    return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
}
