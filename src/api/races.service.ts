import { apiRequest } from './client';
import type { RaceDto, RaceFiltersDto, RaceListResponseDto } from './types';

export function getRaces(filters: RaceFiltersDto = {}): Promise<RaceListResponseDto> {
  return apiRequest<RaceListResponseDto>('/api/races', {
    method: 'GET',
    query: filters,
  });
}

export function getRaceById(id: string): Promise<RaceDto> {
  return apiRequest<RaceDto>(`/api/races/${encodeURIComponent(id)}`, {
    method: 'GET',
  });
}
