import { apiRequest, buildApiUrl } from './client';
import type {
  RaceDto,
  RaceElevationProfileDto,
  RaceFiltersDto,
  RaceListResponseDto,
  SpringPageResponseDto,
} from './types';

type RawRaceListResponseDto = RaceListResponseDto | SpringPageResponseDto<RaceDto>;

function normalizeRaceListResponse(response: RawRaceListResponseDto): RaceListResponseDto {
  if ('items' in response) return response;
  return {
    items: response.content ?? [],
    total: response.totalElements ?? 0,
    page: response.number ?? 0,
    pageSize: response.size ?? 0,
  };
}

export function getRaces(filters: RaceFiltersDto = {}): Promise<RaceListResponseDto> {
  return apiRequest<RawRaceListResponseDto>('/api/races', {
    method: 'GET',
    query: filters,
  }).then(normalizeRaceListResponse);
}

export function getRaceById(id: string): Promise<RaceDto> {
  return apiRequest<RaceDto>(`/api/races/${encodeURIComponent(id)}`, {
    method: 'GET',
  });
}

export function getRaceElevationProfile(raceId: string): Promise<RaceElevationProfileDto | null> {
  return apiRequest<RaceElevationProfileDto>(`/api/races/${encodeURIComponent(raceId)}/elevation-profile`, {
    method: 'GET',
  }).catch(() => null);
}


function resolveGpxUrl(raceId: string, gpxUrl?: string): string {
  if (!gpxUrl) return buildApiUrl(`/api/races/${encodeURIComponent(raceId)}/gpx`);
  if (/^https?:\/\//i.test(gpxUrl)) return gpxUrl;
  return buildApiUrl(gpxUrl.startsWith('/') ? gpxUrl : `/${gpxUrl}`);
}

export function getRaceGpx(raceId: string, gpxUrl?: string): Promise<string | null> {
  const url = resolveGpxUrl(raceId, gpxUrl);

  return fetch(url, { method: 'GET', headers: { Accept: 'application/gpx+xml, application/xml, text/xml' } })
    .then((response) => {
      if (response.status === 404 || response.status === 204) return null;
      if (!response.ok) return null;
      return response.text();
    })
    .catch(() => null);
}
