import { apiRequest } from './client';
import type { RaceDto, RaceFiltersDto, RaceListResponseDto, SpringPageResponseDto } from './types';

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
