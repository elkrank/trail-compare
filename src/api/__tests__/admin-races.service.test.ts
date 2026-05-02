import { beforeEach, describe, expect, it, vi } from 'vitest';
import { patchAdminRace, updateAdminRace } from '../admin-races.service';
import { AppApiError } from '../errors';
import { clearAllTokens, setAccessToken, setRefreshToken } from '../../auth/token-storage';

describe('admin-races.service', () => {
  beforeEach(() => {
    clearAllTokens();
    vi.restoreAllMocks();
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
