import { apiRequest } from './client';
import type { CreateRaceDto, RaceDto, UpdateRaceDto } from './types';

interface AdminRequestOptions {
  accessToken: string;
}

export function createAdminRace(
  payload: CreateRaceDto,
  options: AdminRequestOptions,
): Promise<RaceDto> {
  return apiRequest<RaceDto>('/api/admin/races', {
    method: 'POST',
    body: payload,
    accessToken: options.accessToken,
  });
}

export function updateAdminRace(
  raceId: string,
  payload: UpdateRaceDto,
  options: AdminRequestOptions,
): Promise<RaceDto> {
  return apiRequest<RaceDto>(`/api/admin/races/${encodeURIComponent(raceId)}`, {
    method: 'PUT',
    body: payload,
    accessToken: options.accessToken,
  });
}

export function patchAdminRace(
  raceId: string,
  payload: UpdateRaceDto,
  options: AdminRequestOptions,
): Promise<RaceDto> {
  return apiRequest<RaceDto>(`/api/admin/races/${encodeURIComponent(raceId)}`, {
    method: 'PATCH',
    body: payload,
    accessToken: options.accessToken,
  });
}

export function deleteAdminRace(
  raceId: string,
  options: AdminRequestOptions,
): Promise<void> {
  return apiRequest<void>(`/api/admin/races/${encodeURIComponent(raceId)}`, {
    method: 'DELETE',
    accessToken: options.accessToken,
  });
}
