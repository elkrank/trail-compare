import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createAdminRace, patchAdminRace, updateAdminRace } from '../admin-races.service';
import { AppApiError } from '../errors';
import { clearAllTokens, setAccessToken, setRefreshToken } from '../../auth/token-storage';
import type { CreateRaceDto } from '../types';

const createRacePayload: CreateRaceDto = {
  name: 'Ultra',
  location: 'Chamonix',
  region: 'Auvergne-Rhône-Alpes',
  date: '2026-06-01',
  distanceKm: 50,
  elevationGainM: 2000,
  terrainType: 'MOUNTAIN',
  technicalityLevel: 'HARD',
  cutoffTimeMinutes: 720,
  lastFinisherTimeMinutes: 690,
  medianFinisherTimeMinutes: 540,
  aidStationsCount: 5,
  priceEur: 80,
  description: 'Course de montagne.',
  tags: ['Ultra', 'Technique'],
  sourceUrl: 'https://example.com/ultra',
};

function readBlobText(blob: Blob): Promise<string> {
  if (typeof blob.text === 'function') return blob.text();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsText(blob);
  });
}

describe('admin-races.service', () => {
  beforeEach(() => {
    clearAllTokens();
    vi.restoreAllMocks();
  });

  it('creates race as JSON when no GPX file is provided', async () => {
    setAccessToken('token-a');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'r1', ...createRacePayload, isCancelled: false, createdAt: '', updatedAt: '' }),
    } as Response);

    const race = await createAdminRace(createRacePayload);

    expect(race.id).toBe('r1');
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/races'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-a',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify(createRacePayload),
      }),
    );
  });

  it('creates race as multipart when a GPX file is provided', async () => {
    setAccessToken('token-a');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'r1', ...createRacePayload, isCancelled: false, createdAt: '', updatedAt: '' }),
    } as Response);
    const gpxFile = new File(['<gpx></gpx>'], 'course.gpx', { type: 'application/gpx+xml' });

    await createAdminRace({ ...createRacePayload, gpxFile });

    const [, requestInit] = fetchMock.mock.calls[0];
    const body = (requestInit as RequestInit).body;
    const headers = (requestInit as RequestInit).headers as Record<string, string>;

    expect(body).toBeInstanceOf(FormData);
    expect(headers.Authorization).toBe('Bearer token-a');
    expect(headers).not.toHaveProperty('Content-Type');

    const formData = body as FormData;
    const racePart = formData.get('race');
    expect(racePart).toBeInstanceOf(Blob);
    await expect(readBlobText(racePart as Blob)).resolves.toBe(JSON.stringify(createRacePayload));
    expect(formData.get('gpx')).toBe(gpxFile);
    expect(formData.get('gpxFile')).toBeNull();
  });

  it('does not set a manual Content-Type header for multipart creation', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'r1', ...createRacePayload, isCancelled: false, createdAt: '', updatedAt: '' }),
    } as Response);
    const gpxFile = new File(['<gpx></gpx>'], 'course.gpx', { type: 'application/gpx+xml' });

    await createAdminRace({ ...createRacePayload, gpxFile });

    const [, requestInit] = fetchMock.mock.calls[0];
    const headers = (requestInit as RequestInit).headers as Record<string, string>;
    expect(headers['Content-Type']).toBeUndefined();
    expect(headers['content-type']).toBeUndefined();
  });

  it('update race with PUT success', async () => {
    setAccessToken('token-a');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'r1', name: 'Ultra', location: 'FR', date: '2026-06-01', distanceKm: 50, elevationGainM: 2000, isCancelled: false, createdAt: '', updatedAt: '' }),
    } as Response);

    const race = await updateAdminRace('r1', { name: 'Ultra' });
    expect(race.id).toBe('r1');
  });

  it('update race with PATCH success', async () => {
    setAccessToken('token-a');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'r1', name: 'Ultra+', location: 'FR', date: '2026-06-01', distanceKm: 50, elevationGainM: 2000, isCancelled: false, createdAt: '', updatedAt: '' }),
    } as Response);

    await patchAdminRace('r1', { name: 'Ultra+' });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/admin/races/r1'),
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it.each([401, 404, 500])('returns mapped error on HTTP %s', async (status) => {
    setAccessToken('token-a');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status,
      json: async () => ({ message: 'nope' }),
    } as Response);

    await expect(updateAdminRace('r1', { name: 'x' })).rejects.toBeInstanceOf(AppApiError);
  });

  it('retries once after refresh on 401 then succeeds', async () => {
    setAccessToken('expired-access');
    setRefreshToken('valid-refresh');

    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ message: 'expired' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ accessToken: 'new-access', refreshToken: 'new-refresh' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: 'r1', name: 'Recovered', location: 'FR', date: '2026-06-01', distanceKm: 50, elevationGainM: 2000, isCancelled: false, createdAt: '', updatedAt: '' }),
      } as Response);

    const race = await updateAdminRace('r1', { name: 'Recovered' });

    expect(race.name).toBe('Recovered');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
