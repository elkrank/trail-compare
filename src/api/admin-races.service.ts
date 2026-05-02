import { apiRequest } from './client';
import type { CreateRaceDto, RaceDto, UpdateRaceDto } from './types';

interface AdminRequestOptions {
  accessToken?: string;
}

export function createAdminRace(
  payload: CreateRaceDto,
  _options?: AdminRequestOptions,
): Promise<RaceDto> {
  return apiRequest<RaceDto>('/api/admin/races', {
    method: 'POST',
    body: payload,
  });
}

export function updateAdminRace(
  raceId: string,
  payload: UpdateRaceDto,
  _options?: AdminRequestOptions,
): Promise<RaceDto> {
  return apiRequest<RaceDto>(`/api/admin/races/${encodeURIComponent(raceId)}`, {
    method: 'PUT',
    body: payload,
  });
}

export function patchAdminRace(
  raceId: string,
  payload: UpdateRaceDto,
  _options?: AdminRequestOptions,
): Promise<RaceDto> {
  return apiRequest<RaceDto>(`/api/admin/races/${encodeURIComponent(raceId)}`, {
    method: 'PATCH',
    body: payload,
  });
}

export function deleteAdminRace(
  raceId: string,
  _options?: AdminRequestOptions,
): Promise<void> {
  return apiRequest<void>(`/api/admin/races/${encodeURIComponent(raceId)}`, {
    method: 'DELETE',
  });
}
