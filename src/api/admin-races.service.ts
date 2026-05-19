import { apiRequest } from './client';
import type { CreateRaceWithGpxPayload, RaceDto, UpdateRaceDto, UpdateRaceWithGpxPayload } from './types';

interface AdminRequestOptions {
  accessToken?: string;
}

const MULTIPART_RACE_PART_NAME = 'race';
const MULTIPART_GPX_FILE_PART_NAME = 'gpxFile';

function toMultipartRacePayload(payload: (CreateRaceWithGpxPayload | UpdateRaceWithGpxPayload) & { gpxFile: File }): FormData {
  const { gpxFile, ...race } = payload;
  const formData = new FormData();
  formData.append(
    MULTIPART_RACE_PART_NAME,
    new Blob([JSON.stringify(race)], { type: 'application/json' }),
  );
  formData.append(MULTIPART_GPX_FILE_PART_NAME, gpxFile);
  return formData;
}

export function createAdminRace(
  payload: CreateRaceWithGpxPayload,
  _options?: AdminRequestOptions,
): Promise<RaceDto> {
  const body = payload.gpxFile
    ? toMultipartRacePayload({ ...payload, gpxFile: payload.gpxFile })
    : payload;

  return apiRequest<RaceDto>('/api/admin/races', {
    method: 'POST',
    body,
  });
}

export function updateAdminRace(
  raceId: string,
  payload: UpdateRaceWithGpxPayload,
  _options?: AdminRequestOptions,
): Promise<RaceDto> {
  const body = payload.gpxFile
    ? toMultipartRacePayload({ ...payload, gpxFile: payload.gpxFile })
    : payload;

  return apiRequest<RaceDto>(`/api/admin/races/${encodeURIComponent(raceId)}`, {
    method: 'PUT',
    body,
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
